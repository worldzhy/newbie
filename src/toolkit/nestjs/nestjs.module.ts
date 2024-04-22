import {Global, Module} from '@nestjs/common';
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core';
import {AllExceptionFilter} from './exception-filter/all.exception-filter';
import {PrismaExceptionFilter} from './exception-filter/prisma.exception-filter';
import {ThrottlerExceptionFilter} from './exception-filter/throttler.exception-filter';
import {HttpExceptionFilter} from './exception-filter/http.exception-filter';
import {HttpResponseInterceptor} from './interceptor/http-response.interceptor';
import {NewbieExceptionFilter} from './exception-filter/newbie.exception-filter';

@Global()
@Module({
  providers: [
    // Filters
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 5th priority for all exceptions.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 4nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: NewbieExceptionFilter}, // 3nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 2rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
    {provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor},
  ],
})
export class NestJsModule {}
