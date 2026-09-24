import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerCustomOptions, SwaggerModule} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import {json, urlencoded} from 'express';
import helmet from 'helmet';
import cluster from 'node:cluster';
import os from 'node:os';

export type NewbieEnvironment = 'development' | 'production';

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
   * Swagger config in development. Pass `false` to disable.
   * Defaults to enabled with generic titles (preserves legacy behavior).
   */
  swagger?: NewbieSwaggerOptions | false;
  cluster?: boolean;
}

export interface NewbieBootstrapResult {
  app: NestExpressApplication;
  server: ReturnType<NestExpressApplication['listen']> extends Promise<infer T> ? T : never;
}

function clusterize(callback: () => unknown): void {
  if (cluster.isPrimary) {
    const numCPUs = os.availableParallelism();
    console.log('MASTER SERVER IS RUNNING');

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('online', worker => {
      console.log(`WORKER SERVER ${worker.id} IS ONLINE`);
    });

    cluster.on('exit', worker => {
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
  static async create(rootModule: unknown, options: NewbieAppOptions = {}): Promise<NewbieBootstrapResult | void> {
    const environment: NewbieEnvironment =
      options.environment ?? (process.env.ENVIRONMENT as NewbieEnvironment) ?? 'development';
    const port = options.port ?? (parseInt(process.env.PORT ?? '') || 3000);
    const corsAllowedOrigins = options.corsAllowedOrigins ?? (process.env.ALLOWED_ORIGINS ?? '').split(',');
    const bodyLimit = options.bodyLimit ?? '10mb';
    const requestTimeout = options.requestTimeout ?? 60000; // milliseconds

    const bootstrap = async (): Promise<NewbieBootstrapResult> => {
      // [step 1] Create a nestjs application.
      const app = await NestFactory.create<NestExpressApplication>(rootModule as any);

      // Use v4 query parser.
      app.set('query parser', 'extended');

      app.use(cookieParser());

      // bodyParser was added back to express in release 4.16.0
      // https://stackoverflow.com/questions/47232187/express-json-vs-bodyparser-json
      app.use(json({limit: bodyLimit})); // set max body size
      app.use(urlencoded({limit: bodyLimit, extended: true}));

      // [step 2] Enable features.
      app.enableCors({credentials: true, origin: corsAllowedOrigins});

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
        })
      );

      if (environment === 'production') {
        // helmet is only enabled in production environment.
        app.use(helmet());
      } else if (options.swagger !== false) {
        // API document is only available in development environment.
        const swagger = (options.swagger ?? {}) as NewbieSwaggerOptions;
        const config = new DocumentBuilder()
          .setTitle(swagger.title ?? 'API Document')
          .setDescription(swagger.description ?? "It's good to see you guys 🥤")
          .setVersion(swagger.version ?? '1.0')
          .addCookieAuth('refreshToken')
          .addBearerAuth()
          .build();
        const document = SwaggerModule.createDocument(app, config);
        const customOptions: SwaggerCustomOptions = {
          explorer: true,
          swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
          },
          customSiteTitle: swagger.title ?? 'API Document',
        };
        SwaggerModule.setup(swagger.path ?? 'api', app, document, customOptions);
      }

      // [step 3] Listen port.
      const server = await app.listen(port, '0.0.0.0');
      server.timeout = requestTimeout;

      console.log(`Application is running on: ${await app.getUrl()}`);

      return {app, server};
    };

    if (options.cluster) {
      clusterize(bootstrap);
    } else {
      return bootstrap();
    }
  }
}
