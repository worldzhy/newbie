import {
  DynamicModule,
  Injectable,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { resolveBackendMonitorOptions } from "../backend-monitor.options";
import { MonitorEventReporter } from "../backend-monitor.reporter";
import { BackendMonitorOptions, ResolvedBackendMonitorOptions } from "../backend-monitor.types";
import { BackendMonitorInterceptor } from "./backend-monitor.interceptor";
import { BackendMonitorMiddleware } from "./backend-monitor.middleware";

/** DI token for the resolved monitoring options. */
export const BACKEND_MONITOR_OPTIONS = Symbol("BACKEND_MONITOR_OPTIONS");

/**
 * Bridges the dependency-free reporter into the Nest lifecycle: Nest
 * instantiates this provider and calls start()/stop() on module init/destroy.
 */
@Injectable()
class MonitorReporterLifecycle implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly reporter: MonitorEventReporter) {}

  onModuleInit(): void {
    this.reporter.start();
  }

  onModuleDestroy(): void {
    this.reporter.stop();
  }
}

/**
 * Built-in backend monitor probe.
 *
 * Usage in the project's business module:
 *
 *   BackendMonitorModule.forRoot({
 *     endpoint: process.env.BACKEND_MONITOR_ENDPOINT ?? "",
 *     // MonitorInstallation report token (module-hub design §9.2), issued by
 *     // POST /backend-monitor/installations or auto-enrolled by the platform
 *     // when a BACKEND application is created; sent as X-Backend-Monitor-Token.
 *     token: process.env.BACKEND_MONITOR_TOKEN ?? "",
 *   })
 *
 * Activation follows the same convention as the heartbeat/health/module-hub
 * reporters: when `endpoint` or `token` is empty (unset env) the module
 * installs nothing — no middleware, no interceptor, no timer: zero cost and
 * zero behavior. Dotenv must be loaded before module metadata is evaluated.
 */
@Module({})
export class BackendMonitorModule {
  static forRoot(options: BackendMonitorOptions): DynamicModule {
    if (!options.endpoint || !options.token) {
      return { module: BackendMonitorModule, global: true };
    }

    const resolved = resolveBackendMonitorOptions(options);

    /**
     * Concrete module class built only when credentials are present; Nest
     * reads its static metadata and invokes configure() to register the
     * middleware globally.
     */
    @Module({
      providers: [
        { provide: BACKEND_MONITOR_OPTIONS, useValue: resolved },
        // Factory (not a class provider): the reporter's constructor takes
        // plain option/transport arguments that Nest cannot infer by type.
        {
          provide: MonitorEventReporter,
          useFactory: (monitorOptions: ResolvedBackendMonitorOptions) => new MonitorEventReporter(monitorOptions),
          inject: [BACKEND_MONITOR_OPTIONS],
        },
        MonitorReporterLifecycle,
        BackendMonitorMiddleware,
        { provide: APP_INTERCEPTOR, useClass: BackendMonitorInterceptor },
      ],
      exports: [MonitorEventReporter],
    })
    class ConfiguredBackendMonitorModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer.apply(BackendMonitorMiddleware).forRoutes("{*splat}");
      }
    }

    return { module: ConfiguredBackendMonitorModule, global: true };
  }
}
