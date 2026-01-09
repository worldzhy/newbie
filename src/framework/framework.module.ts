import {Global, Logger, MiddlewareConsumer, Module} from '@nestjs/common';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {HttpModule} from '@nestjs/axios';
import {ConfigModule} from '@nestjs/config';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import FrameworkConfiguration from './framework.config';
import {PrismaModule} from '@framework/prisma/prisma.module';
import {AllExceptionFilter} from '@framework/exception-filters/all.exception-filter';
import {HttpExceptionFilter} from '@framework/exception-filters/http.exception-filter';
import {NewbieExceptionFilter} from '@framework/exception-filters/newbie.exception-filter';
import {PrismaExceptionFilter} from '@framework/exception-filters/prisma.exception-filter';
import {ThrottlerExceptionFilter} from '@framework/exception-filters/throttler.exception-filter';
import {HttpResponseInterceptor} from '@framework/interceptors/http-response.interceptor';
import {HttpMiddleware} from '@framework/middlewares/http.middleware';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({load: [FrameworkConfiguration], isGlobal: true}),
    ThrottlerModule.forRoot({
      // Maximum of 10000 requests / 1000 milliseconds for each endpoint.
      throttlers: [{limit: 10000, ttl: 1000}],
    }),
    HttpModule,
    PrismaModule,
  ],
  providers: [
    // Filters
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 5th priority for all exceptions.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 4nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: NewbieExceptionFilter}, // 3nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 2rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
    {provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor},
    Logger,
  ],
  exports: [HttpModule, Logger],
})
export class FrameworkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('{*splat}');
  }
}
