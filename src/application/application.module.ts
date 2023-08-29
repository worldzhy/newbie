import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import ApplicationConfiguration from '@_config/application.config';
import MicroservicesConfiguration from '@_config/microservice.config';
import ToolkitConfiguration from '@_config/toolkit.config';
import {AllExceptionFilter} from '@_filter/_all-exception.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';

import {AuthenticationGuard} from '@microservices/account/authentication/authentication.guard';
import {AuthorizationGuard} from '@microservices/account/authorization/authorization.guard';
import {SecurityGuard} from '@microservices/account/security/security.guard';

import {ApplicationController} from '@application/application.controller';
import {AccountForgotController} from '@application-example/account/account-forgot.controller';
import {AccountLoginController} from '@application-example/account/account-login.controller';
import {AccountLogoutController} from '@application-example/account/account-logout.controller';
import {AccountSignupController} from '@application-example/account/account-signup.controller';
import {AccountOthersController} from '@application-example/account/account-others.controller';
import {UserController} from '@application-example/account/user.controller';
import {UserProfileController} from '@application-example/account/user-profile.controller';

import {SpaceController} from '@application/event-calendar/space.controller';
import {EventTypeController} from '@application/event-calendar/event-type.controller';
import {EventCalendarController} from '@application/event-calendar/event-calendar.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        ApplicationConfiguration,
        MicroservicesConfiguration,
        ToolkitConfiguration,
      ],
      isGlobal: true,
    }),

    // Rate Limit (Maximum of 60 requests per 60 seconds)
    ThrottlerModule.forRoot({
      limit: 60,
      ttl: 60,
    }),

    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    AccountModule,
    EventSchedulingModule,
  ],
  providers: [
    // Guards
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: SecurityGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    // Filters
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 4th priority for all exceptions.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 3rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 2nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
  ],
  controllers: [
    ApplicationController,
    AccountForgotController,
    AccountLoginController,
    AccountLogoutController,
    AccountSignupController,
    AccountOthersController,
    UserController,
    UserProfileController,
    SpaceController,
    EventTypeController,
    EventCalendarController,
  ],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
