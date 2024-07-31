import {Global, Logger, MiddlewareConsumer, Module} from '@nestjs/common';
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core';
import {ConfigModule} from '@nestjs/config';
import {HttpModule} from '@nestjs/axios';
import {AllExceptionFilter} from './exception-filters/all.exception-filter';
import {PrismaExceptionFilter} from './exception-filters/prisma.exception-filter';
import {ThrottlerExceptionFilter} from './exception-filters/throttler.exception-filter';
import {HttpExceptionFilter} from './exception-filters/http.exception-filter';
import {NewbieExceptionFilter} from './exception-filters/newbie.exception-filter';
import {HttpResponseInterceptor} from './interceptors/http-response.interceptor';
import {HttpMiddleware} from './middlewares/http.middleware';
import FrameworkConfiguration from './framework.config';




@Global()
@Module({
  imports: [
    ConfigModule.forRoot({load: [FrameworkConfiguration], isGlobal: true}),
    HttpModule,  
  ],
  providers: [
    // Filters
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 5th priority for all exceptions.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 4nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: NewbieExceptionFilter}, // 3nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 2rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
    {provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor},
    Logger
  ],
  exports: [HttpModule],
})
export class FrameworkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
