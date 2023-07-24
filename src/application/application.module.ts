import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {AuthenticationGuard} from './account/authentication/authentication.guard';
import {AuthorizationGuard} from './account/authorization/authorization.guard';
import {AllExceptionsFilter} from '../_filter/_all-exceptions.filter';
import {HttpExceptionFilter} from '../_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '../_filter/_prisma-exception.filter';
import {HttpMiddleware} from '../_middleware/_http.middleware';

import {ApplicationController} from './application.controller';
import {ToolkitModule} from '../toolkit/toolkit.module';
import {FileManagementModule} from '../microservices/fmgmt/fmgmt.module';
import {CustomLoggerModule} from '../microservices/logger/logger.module';
import {UserModule} from '../microservices/user/user.module';
import {NotificationModule} from '../microservices/notification/notification.module';
import {VerificationCodeModule} from '../microservices/verification-code/verification-code.module';
import {WorkflowModule} from '../microservices/workflow/workflow.module';
import {AccountModule} from './account/account.module';
import {EnginedModule} from './engined/engined.module';
import {ProjectManagementModule} from './pmgmt/pmgmt.module';
import {RecruitmentModule} from './recruitment/recruitment.module';
import {ConfigModule} from '@nestjs/config';
import ApplicationConfiguration from '../_config/application.config';
import MicroservicesConfiguration from '../_config/microservices.config';
import ToolkitConfiguration from '../_config/toolkit.config';

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
    ScheduleModule.forRoot(),

    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    FileManagementModule,
    CustomLoggerModule,
    UserModule,
    NotificationModule,
    VerificationCodeModule,
    WorkflowModule,

    // Application
    AccountModule,
    EnginedModule,
    ProjectManagementModule,
    RecruitmentModule,
  ],
  providers: [
    // Guards
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 2nd priority guard.

    // Filters
    {provide: APP_FILTER, useClass: AllExceptionsFilter}, // 3rd priority for all exceptions.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 2nd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 1st priority for exceptions thrown by controllers.
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
