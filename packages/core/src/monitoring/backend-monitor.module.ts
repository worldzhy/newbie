import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { hostname } from "node:os";
import { BackendMonitorInterceptor } from "./backend-monitor.interceptor";
import { BackendMonitorMiddleware } from "./backend-monitor.middleware";
import { MonitorEventReporter } from "./backend-monitor.reporter";
import {
  BackendMonitorOptions,
  ResolvedBackendMonitorOptions,
} from "./backend-monitor.types";

/** DI token for the resolved monitoring options. */
export const BACKEND_MONITOR_OPTIONS = Symbol("BACKEND_MONITOR_OPTIONS");

/**
 * Built-in backend monitor probe.
 *
 * Usage in the project's business module:
 *
 *   BackendMonitorModule.forRoot({
 *     enabled: bool(process.env.BACKEND_MONITOR_ENABLED),
 *     endpoint: process.env.BACKEND_MONITOR_API_URL,
 *     token: process.env.BACKEND_MONITOR_REPORT_TOKEN,
 *   })
 *
 * When disabled (the default) the module installs nothing: no middleware,
 * no interceptor, no timer — the probe has zero cost and zero behavior.
 */
@Module({})
export class BackendMonitorModule {
  static forRoot(options: BackendMonitorOptions): DynamicModule {
    if (!options.enabled) {
      return { module: BackendMonitorModule, global: true };
    }

    const resolved: ResolvedBackendMonitorOptions = {
      enabled: true,
      endpoint: options.endpoint,
      token: options.token,
      env: options.env ?? process.env.ENVIRONMENT ?? "",
      appVersion: options.appVersion ?? "",
      instanceId: options.instanceId ?? hostname(),
      flushIntervalMs: options.flushIntervalMs ?? 5000,
      maxBatchSize: options.maxBatchSize ?? 500,
      maxQueueSize: options.maxQueueSize ?? 2000,
    };

    /**
     * Concrete module class built only when enabled; Nest reads its static
     * metadata and invokes configure() to register the middleware globally.
     */
    @Module({
      providers: [
        { provide: BACKEND_MONITOR_OPTIONS, useValue: resolved },
        // Factory (not a class provider): the reporter's constructor takes
        // plain option/transport arguments that Nest cannot infer by type.
        {
          provide: MonitorEventReporter,
          useFactory: (monitorOptions: ResolvedBackendMonitorOptions) =>
            new MonitorEventReporter(monitorOptions),
          inject: [BACKEND_MONITOR_OPTIONS],
        },
        BackendMonitorMiddleware,
        { provide: APP_INTERCEPTOR, useClass: BackendMonitorInterceptor },
      ],
      exports: [MonitorEventReporter],
    })
    class EnabledBackendMonitorModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer.apply(BackendMonitorMiddleware).forRoutes("{*splat}");
      }
    }

    return { module: EnabledBackendMonitorModule, global: true };
  }
}
