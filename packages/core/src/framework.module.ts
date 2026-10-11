import { DynamicModule, Global, Logger, MiddlewareConsumer } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { BackendMonitorModule } from "@devbie/backend-monitor-sdk/nest";
import FrameworkConfiguration from "./framework.config";
import { PrismaModule, PrismaModuleOptions } from "./prisma/prisma.module";
import { AllExceptionFilter } from "./exception-filters/all.exception-filter";
import { HttpExceptionFilter } from "./exception-filters/http.exception-filter";
import { NewbieExceptionFilter } from "./exception-filters/newbie.exception-filter";
import { PrismaExceptionFilter } from "./exception-filters/prisma.exception-filter";
import { ThrottlerExceptionFilter } from "./exception-filters/throttler.exception-filter";
import { HttpResponseInterceptor } from "./interceptors/http-response.interceptor";
import { HttpMiddleware } from "./middlewares/http.middleware";

export interface FrameworkModuleOptions {
  /** Supplied to PrismaModule.forRoot — the project's generated PrismaClient constructor. */
  prisma: PrismaModuleOptions;
}

/**
 * Env-gated backend monitor assembly, mirroring the module-hub reporter
 * (MODULE_HUB_* env contract): the probe installs only when both
 * BACKEND_MONITOR_API_URL and BACKEND_MONITOR_REPORT_TOKEN are set;
 * otherwise it is absent entirely (zero middleware, zero timer).
 *
 * Hosts that need non-env configuration can still register
 * BackendMonitorModule.forRoot() in their own modules — this only supplies
 * the zero-config default.
 */
export function resolveBackendMonitorModule(): DynamicModule | null {
  const endpoint = process.env.BACKEND_MONITOR_API_URL;
  const token = process.env.BACKEND_MONITOR_REPORT_TOKEN;
  if (!endpoint || !token) return null;
  return BackendMonitorModule.forRoot({ enabled: true, endpoint, token });
}

/**
 * Register with forRoot() in the project's root module:
 *
 *   FrameworkModule.forRoot({prisma: {PrismaClient}})
 */
@Global()
export class FrameworkModule {
  static forRoot(options: FrameworkModuleOptions): DynamicModule {
    const backendMonitor = resolveBackendMonitorModule();
    return {
      global: true,
      module: FrameworkModule,
      imports: [
        ConfigModule.forRoot({ load: [FrameworkConfiguration], isGlobal: true }),
        ThrottlerModule.forRoot({
          // Maximum of 10000 requests / 1000 milliseconds for each endpoint.
          throttlers: [{ limit: 10000, ttl: 1000 }],
        }),
        HttpModule,
        PrismaModule.forRoot(options.prisma),
        ...(backendMonitor ? [backendMonitor] : []),
      ],
      providers: [
        // Guards
        { provide: APP_GUARD, useClass: ThrottlerGuard }, // 1st priority guard.
        // Filters
        { provide: APP_FILTER, useClass: AllExceptionFilter }, // 5th priority for all exceptions.
        { provide: APP_FILTER, useClass: HttpExceptionFilter }, // 4nd priority for exceptions thrown by controllers.
        { provide: APP_FILTER, useClass: NewbieExceptionFilter }, // 3nd priority for exceptions thrown by controllers.
        { provide: APP_FILTER, useClass: PrismaExceptionFilter }, // 2rd priority for exceptions thrown by services.
        { provide: APP_FILTER, useClass: ThrottlerExceptionFilter }, // 1st priority for exceptions thrown by throttler (rate limit).
        { provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor },
        Logger,
      ],
      exports: [HttpModule, Logger],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes("{*splat}");
  }
}
