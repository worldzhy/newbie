import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, text, urlencoded } from "express";
import helmet from "helmet";
import cluster from "node:cluster";
import os from "node:os";
import { listenWithPortRaceRecovery } from "./port-race";
import { registerGracefulShutdown } from "./graceful-shutdown";

export type NewbieEnvironment = "development" | "production";

export interface NewbieSwaggerOptions {
  title: string;
  description?: string;
  version?: string;
  /** Swagger UI path, defaults to '/api'. */
  path?: string;
}

export interface NewbieAppOptions {
  environment?: NewbieEnvironment;
  port?: number;
  corsAllowedOrigins?: string[];
  bodyLimit?: string;
  requestTimeout?: number;
  /**
   * Reduce keep-alive so idle connections don't delay server.close() during
   * watch-mode restarts (which would hold the port longer than necessary).
   */
  keepAliveTimeout?: number;
  /**
   * NestJS log levels (e.g. ['log', 'warn', 'error']). Defaults to the
   * comma-separated LOG_LEVEL env var, or ['log', 'warn', 'error'] so that
   * verbose/debug logs do not spam the console in normal runs.
   */
  logger?: string[];
  /**
   * Also parse `text/plain` request bodies. Required by report endpoints whose
   * browser SDKs send payloads via sendBeacon (which posts text/plain).
   */
  textBodyParser?: boolean;
  /**
   * Express middleware registered BEFORE the global CORS middleware. Use it
   * for route whitelists that must override the global origin policy.
   */
  beforeCors?: (req: any, res: any, next: () => void) => void;
  /**
   * Function-style CORS resolver passed verbatim to app.enableCors(). When
   * set, it replaces the static {credentials, origin: corsAllowedOrigins}
   * config entirely.
   */
  corsResolver?: (
    req: any,
    callback: (err: unknown, options?: unknown) => void,
  ) => void;
  /**
   * Survive port races during `nest start --watch` under Docker bind mounts:
   * probe the port, kill stale previous-generation holders, stand down when a
   * same-generation sibling wins, and fall back to SO_REUSEPORT. Also installs
   * fast-shutdown SIGTERM/SIGINT handlers that release the port immediately.
   */
  portRaceRecovery?: boolean;
  /**
   * Grace period for in-flight requests on SIGTERM/SIGINT when
   * portRaceRecovery is disabled (production). Idle keep-alive connections
   * are dropped immediately; requests still running after this timeout get
   * force-closed so the process can exit. Defaults to 10s.
   */
  shutdownTimeoutMs?: number;
  /**
   * Swagger config in development. Pass `false` to disable.
   * Defaults to enabled with generic titles (preserves legacy behavior).
   */
  swagger?: NewbieSwaggerOptions | false;
  cluster?: boolean;
}

export interface NewbieBootstrapResult {
  app: NestExpressApplication;
  server: ReturnType<NestExpressApplication["listen"]> extends Promise<infer T>
    ? T
    : never;
}

function clusterize(callback: () => unknown): void {
  if (cluster.isPrimary) {
    const numCPUs = os.availableParallelism();
    console.log("MASTER SERVER IS RUNNING");

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("online", (worker) => {
      console.log(`WORKER SERVER ${worker.id} IS ONLINE`);
    });

    cluster.on("exit", (worker) => {
      console.log(`WORKER SERVER ${worker.id} EXITED`);
      cluster.fork();
    });
  } else {
    callback();
  }
}

export class NewbieFactory {
  /**
   * Creates and starts a fully configured NestJS (Express) application.
   *
   *   NewbieFactory.create(ApplicationModule, {swagger: {title: 'My API'}})
   */
  static async create(
    rootModule: unknown,
    options: NewbieAppOptions = {},
  ): Promise<NewbieBootstrapResult | void> {
    const environment: NewbieEnvironment =
      options.environment ??
      (process.env.ENVIRONMENT as NewbieEnvironment) ??
      "development";
    const port = options.port ?? (parseInt(process.env.PORT ?? "") || 3000);
    const corsAllowedOrigins =
      options.corsAllowedOrigins ??
      (process.env.ALLOWED_ORIGINS ?? "").split(",");
    const bodyLimit = options.bodyLimit ?? "10mb";
    const requestTimeout = options.requestTimeout ?? 60000; // milliseconds

    const bootstrap = async (): Promise<NewbieBootstrapResult> => {
      // [step 1] Create a nestjs application.
      // Explicitly set log levels so that verbose/debug logs (e.g. distributed
      // lock acquisitions) do not spam the console in normal runs. Set
      // LOG_LEVEL=verbose (or debug) via env to enable troubleshooting.
      const logLevel =
        options.logger ??
        (process.env.LOG_LEVEL
          ? process.env.LOG_LEVEL.split(",").map((s) => s.trim())
          : ["log", "warn", "error"]);
      const app = await NestFactory.create<NestExpressApplication>(
        rootModule as any,
        {
          logger: logLevel as any,
        },
      );

      // Shutdown signal handling is installed after listen():
      //  - dev (portRaceRecovery): hard exit to release the port instantly
      //  - prod: bounded graceful shutdown (see registerGracefulShutdown)
      // Both call app.close() / run onModuleDestroy hooks themselves, so the
      // framework-managed Nest signal listeners are intentionally not enabled
      // (they would double-register for the same signals).

      // Use v4 query parser.
      app.set("query parser", "extended");

      app.use(cookieParser());

      // bodyParser was added back to express in release 4.16.0
      // https://stackoverflow.com/questions/47232187/express-json-vs-bodyparser-json
      app.use(json({ limit: bodyLimit })); // set max body size
      app.use(urlencoded({ limit: bodyLimit, extended: true }));
      if (options.textBodyParser) {
        app.use(text({ type: "text/plain" }));
      }

      // [step 2] Enable features.

      // Project hook registered before the global CORS middleware, e.g. an
      // open-route whitelist that overrides the origin policy.
      if (options.beforeCors) {
        app.use(options.beforeCors);
      }

      if (options.corsResolver) {
        app.enableCors(options.corsResolver as any);
      } else {
        app.enableCors({ credentials: true, origin: corsAllowedOrigins });
      }

      app.useGlobalPipes(
        new ValidationPipe({
          /**
           * By default, every path parameter and query parameter comes over the network as a string.
           * The ValidationPipe automatically converts a string identifier to a number when the
           * method signature declares a number.
           */
          transform: true,
          /**
           * Strip validated objects of properties without validation decorators.
           */
          whitelist: true,
        }),
      );

      if (environment === "production") {
        // helmet is only enabled in production environment.
        app.use(helmet());
      } else if (options.swagger !== false) {
        // API document is only available in development environment.
        const swagger = (options.swagger ?? {}) as NewbieSwaggerOptions;
        const config = new DocumentBuilder()
          .setTitle(swagger.title ?? "API Document")
          .setDescription(swagger.description ?? "It's good to see you guys 🥤")
          .setVersion(swagger.version ?? "1.0")
          .addCookieAuth("refreshToken")
          .addBearerAuth()
          .build();
        const document = SwaggerModule.createDocument(app, config);
        const customOptions: SwaggerCustomOptions = {
          explorer: true,
          swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: "alpha",
          },
          customSiteTitle: swagger.title ?? "API Document",
        };
        SwaggerModule.setup(
          swagger.path ?? "api",
          app,
          document,
          customOptions,
        );
      }

      // [step 3] Listen port. With portRaceRecovery enabled, probe the port,
      // evict stale holders and survive `nest start --watch` port races.
      const server = options.portRaceRecovery
        ? await listenWithPortRaceRecovery(app, port, "0.0.0.0")
        : await app.listen(port, "0.0.0.0");
      server.timeout = requestTimeout;
      if (options.keepAliveTimeout !== undefined) {
        server.keepAliveTimeout = options.keepAliveTimeout;
      }

      if (!options.portRaceRecovery) {
        // Production-style shutdown: drain in-flight requests within a bounded
        // grace period and always terminate afterwards.
        registerGracefulShutdown(
          app,
          server,
          options.shutdownTimeoutMs ?? 10_000,
        );
      }

      console.log(`Application is running on: ${await app.getUrl()}`);

      return { app, server };
    };

    if (options.cluster) {
      clusterize(bootstrap);
    } else {
      return bootstrap();
    }
  }
}
