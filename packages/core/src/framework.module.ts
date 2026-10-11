import { DynamicModule, Global, Logger, MiddlewareConsumer } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
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
  /** Rate-limit window in milliseconds. Default 1000. */
  throttleTtl?: number;
  /** Max requests per throttle window. Default 10000 (effectively off). */
  throttleLimit?: number;
}

/**
 * Register with forRoot() in the project's root module:
 *
 *   FrameworkModule.forRoot({prisma: {PrismaClient}})
 */
@Global()
export class FrameworkModule {
  static forRoot(options: FrameworkModuleOptions): DynamicModule {
    return {
      global: true,
      module: FrameworkModule,
      imports: [
        ConfigModule.forRoot({ load: [FrameworkConfiguration], isGlobal: true }),
        ThrottlerModule.forRoot({
          throttlers: [{ limit: options.throttleLimit ?? 10000, ttl: options.throttleTtl ?? 1000 }],
        }),
        HttpModule,
        PrismaModule.forRoot(options.prisma),
      ],
      providers: [
        // Guards
        { provide: APP_GUARD, useClass: ThrottlerGuard }, // 1st priority guard.
        // Filters
        { provide: APP_FILTER, useClass: AllExceptionFilter }, // 5th priority for all exceptions.
        { provide: APP_FILTER, useClass: HttpExceptionFilter }, // 4th priority for exceptions thrown by controllers.
        { provide: APP_FILTER, useClass: NewbieExceptionFilter }, // 3rd priority for exceptions thrown by controllers.
        { provide: APP_FILTER, useClass: PrismaExceptionFilter }, // 2nd priority for exceptions thrown by services.
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
