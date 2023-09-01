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

import {AuthenticationGuard} from '@microservices/account/authentication/authentication.guard';
import {AuthorizationGuard} from '@microservices/account/authorization/authorization.guard';
import {SecurityGuard} from '@microservices/account/security/security.guard';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {FileManagementModule} from '@microservices/fmgmt/fmgmt.module';
import {GmapModule} from '@microservices/google-map/gmap.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/omgmt/omgmt.module';
import {ProjectManagementModule} from '@microservices/pmgmt/pmgmt.module';
import {TaskModule} from '@microservices/task/task.module';
import {TaskSchedulingModule} from '@microservices/task-scheduling/task-scheduling.module';
import {VerificationCodeModule} from '@microservices/verification-code/verification-code.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';

import {EnginedModule} from '@application-example/engined/engined.module';
import {RecruitmentModule} from '@application-example/recruitment/recruitment.module';

import {ApplicationExampleController} from '@application-example/application-example.controller';
import {AccountForgotController} from '@application-example/account/account-forgot.controller';
import {AccountLoginController} from '@application-example/account/account-login.controller';
import {AccountLogoutController} from '@application-example/account/account-logout.controller';
import {AccountSignupController} from '@application-example/account/account-signup.controller';
import {AccountOthersController} from '@application-example/account/account-others.controller';
import {OrganizationController} from '@application-example/account/organization.controller';
import {UserController} from '@application-example/account/user.controller';
import {UserProfileController} from '@application-example/account/user-profile.controller';
import {PermissionController} from '@application-example/account/permission.controller';
import {RoleController} from '@application-example/account/role.controller';
import {GmapPlaceController} from '@application-example/google-map/gmap-place.controller';
import {NotificationController} from '@application-example/notification/notification.controller';
import {ProjectCheckpointController} from '@application-example/pmgmt/checkpoint.controller';
import {ProjectEnvironmentController} from '@application-example/pmgmt/environment.controller';
import {ProjectInfrastructureStackController} from '@application-example/pmgmt/infrastructure-stack.controller';
import {ProjectElementController} from '@application-example/pmgmt/project-element.controller';
import {ProjectController} from '@application-example/pmgmt/project.controller';
import {WorkflowController} from '@application-example/workflow/workflow.controller';
import {WorkflowStateController} from '@application-example/workflow/workflow-state.controller';
import {WorkflowViewController} from '@application-example/workflow/workflow-view.controller';
import {WorkflowViewComponentController} from '@application-example/workflow/workflow-view-component.controller';
import {WorkflowRouteController} from '@application-example/workflow/workflow-route.controller';

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
    FileManagementModule,
    GmapModule,
    NotificationModule,
    OrderManagementModule,
    ProjectManagementModule,
    TaskModule,
    TaskSchedulingModule,
    VerificationCodeModule,
    WorkflowModule,

    // Application
    EnginedModule,
    RecruitmentModule,
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
    ApplicationExampleController,
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

    GmapPlaceController,

    NotificationController,

    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureStackController,
    ProjectElementController,
    ProjectController,

    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
  ],
})
export class ApplicationExampleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
