import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import ApplicationConfiguration from '@_config/application.config';
import MicroservicesConfiguration from '@_config/microservice.config';
import ToolkitConfiguration from '@_config/toolkit.config';
import {AllExceptionsFilter} from '@_filter/_all-exceptions.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

import {ToolkitModule} from '@toolkit/toolkit.module';

import {AuthenticationGuard} from '@microservices/account/authentication/authentication.guard';
import {AuthorizationGuard} from '@microservices/account/authorization/authorization.guard';
import {SecurityGuard} from '@microservices/account/security/security.guard';
import {AccountModule} from '@microservices/account/account.module';
import {FileManagementModule} from '@microservices/fmgmt/fmgmt.module';
import {LocationModule} from '@microservices/location/location.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/omgmt/omgmt.module';
import {ReservationModule} from '@microservices/event-calendar/event-calendar.module';
import {TaskModule} from '@microservices/task/task.module';
import {TaskSchedulingModule} from '@microservices/task-scheduling/task-scheduling.module';
import {VerificationCodeModule} from '@microservices/verification-code/verification-code.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';

import {EnginedModule} from '@application/engined/engined.module';
import {ProjectManagementModule} from '@application/pmgmt/pmgmt.module';
import {RecruitmentModule} from '@application/recruitment/recruitment.module';

import {ApplicationController} from '@application/application.controller';
import {AccountForgotController} from '@application/account/account-forgot.controller';
import {AccountLoginController} from '@application/account/account-login.controller';
import {AccountLogoutController} from '@application/account/account-logout.controller';
import {AccountSignupController} from '@application/account/account-signup.controller';
import {AccountOthersController} from '@application/account/account-others.controller';
import {OrganizationController} from '@application/account/organization.controller';
import {UserController} from '@application/account/user.controller';
import {UserProfileController} from '@application/account/user-profile.controller';
import {PermissionController} from '@application/account/permission.controller';
import {RoleController} from '@application/account/role.controller';
import {ClassController} from '@application/class-calendar/class.controller';
import {ClassCalendarController} from '@application/class-calendar/class-calendar.controller';
import {WorkflowController} from '@application/workflow/workflow.controller';
import {WorkflowStateController} from '@application/workflow/workflow-state.controller';
import {WorkflowViewController} from '@application/workflow/workflow-view.controller';
import {WorkflowViewComponentController} from '@application/workflow/workflow-view-component.controller';
import {WorkflowRouteController} from '@application/workflow/workflow-route.controller';
import {AwsController} from '@application/samples/aws.controller';
import {LocationController} from '@application/samples/location.controller';
import {NotificationController} from '@application/samples/notification.controller';

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
    FileManagementModule,
    LocationModule,
    NotificationModule,
    OrderManagementModule,
    ReservationModule,
    TaskModule,
    TaskSchedulingModule,
    VerificationCodeModule,
    WorkflowModule,

    // Application
    EnginedModule,
    ProjectManagementModule,
    RecruitmentModule,
  ],
  providers: [
    // Guards
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: SecurityGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    // Filters
    {provide: APP_FILTER, useClass: AllExceptionsFilter}, // 4th priority for all exceptions.
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
    OrganizationController,
    UserController,
    UserProfileController,
    PermissionController,
    RoleController,
    ClassController,
    ClassCalendarController,
    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
    AwsController,
    LocationController,
    NotificationController,
  ],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
