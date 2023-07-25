import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AuthenticationGuard} from '../microservices/account/authentication/authentication.guard';
import {AuthorizationGuard} from '../microservices/account/authorization/authorization.guard';
import {AllExceptionsFilter} from '../_filter/_all-exceptions.filter';
import {HttpExceptionFilter} from '../_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '../_filter/_prisma-exception.filter';
import {HttpMiddleware} from '../_middleware/_http.middleware';

import {ToolkitModule} from '../toolkit/toolkit.module';
import {AccountModule} from '../microservices/account/account.module';
import {FileManagementModule} from '../microservices/fmgmt/fmgmt.module';
import {LocationModule} from '../microservices/location/location.module';
import {NotificationModule} from '../microservices/notification/notification.module';
import {OrderManagementModule} from '../microservices/omgmt/omgmt.module';
import {SchedulingModule} from '../microservices/scheduling/scheduling.module';
import {TaskModule} from 'src/microservices/task/task.module';
import {VerificationCodeModule} from '../microservices/verification-code/verification-code.module';
import {WorkflowModule} from '../microservices/workflow/workflow.module';
import {EnginedModule} from './engined/engined.module';
import {ProjectManagementModule} from './pmgmt/pmgmt.module';
import {RecruitmentModule} from './recruitment/recruitment.module';
import ApplicationConfiguration from '../_config/application.config';
import MicroservicesConfiguration from '../_config/microservice.config';
import ToolkitConfiguration from '../_config/toolkit.config';

import {ApplicationController} from './application.controller';
import {AccountForgotController} from './account/account-forgot.controller';
import {AccountLoginController} from './account/account-login.controller';
import {AccountLogoutController} from './account/account-logout.controller';
import {AccountSignupController} from './account/account-signup.controller';
import {AccountOthersController} from './account/account-others.controller';
import {OrganizationController} from './account/organization.controller';
import {UserController} from './account/user/user.controller';
import {UserProfileController} from './account/user/user-profile.controller';
import {PermissionController} from './account/permission.controller';
import {RoleController} from './account/role.controller';
import {WorkflowController} from './samples/workflow/workflow.controller';
import {WorkflowStateController} from './samples/workflow/workflow-state.controller';
import {WorkflowViewController} from './samples/workflow/workflow-view.controller';
import {WorkflowViewComponentController} from './samples/workflow/workflow-view-component.controller';
import {WorkflowRouteController} from './samples/workflow/workflow-route.controller';
import {AwsController} from './samples/aws.controller';
import {LocationController} from './samples/location.controller';
import {NotificationController} from './samples/notification.controller';

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

    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    AccountModule,
    FileManagementModule,
    LocationModule,
    NotificationModule,
    OrderManagementModule,
    SchedulingModule,
    TaskModule,
    VerificationCodeModule,
    WorkflowModule,

    // Application
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
