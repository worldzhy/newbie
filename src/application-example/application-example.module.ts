import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
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
import {FileManagementModule} from '@microservices/fmgmt/fmgmt.module';
import {MapModule} from '@microservices/map/map.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/omgmt/omgmt.module';
import {ProjectManagementModule} from '@microservices/pmgmt/pmgmt.module';
import {TagModule} from '@microservices/tag/tag.module';
import {TaskModule} from '@microservices/task/task.module';
import {TaskSchedulingModule} from '@microservices/task-scheduling/task-scheduling.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';

import {EnginedModule} from './engined/engined.module';
import {RecruitmentModule} from './recruitment/recruitment.module';
import {ApplicationExampleController} from './application-example.controller';
import {AccountLoginController} from './account/account-login.controller';
import {AccountLogoutController} from './account/account-logout.controller';
import {AccountOthersController} from './account/account-others.controller';
import {AccountPasswordController} from './account/account-password.controller';
import {AccountSignupController} from './account/account-signup.controller';
import {OrganizationController} from './account/organization.controller';
import {UserController} from './account/user.controller';
import {UserProfileController} from './account/user-profile.controller';
import {PermissionController} from './account/permission.controller';
import {RoleController} from './account/role.controller';
import {PlaceController} from './map/place.controller';
import {NotificationController} from './notification/notification.controller';
import {ProjectCheckpointController} from './pmgmt/checkpoint.controller';
import {ProjectEnvironmentController} from './pmgmt/environment.controller';
import {ProjectInfrastructureStackController} from './pmgmt/infrastructure-stack.controller';
import {ProjectElementController} from './pmgmt/project-element.controller';
import {ProjectController} from './pmgmt/project.controller';
import {TagController} from './tag/tag.controller';
import {WorkflowController} from './workflow/workflow.controller';
import {WorkflowStateController} from './workflow/workflow-state.controller';
import {WorkflowViewController} from './workflow/workflow-view.controller';
import {WorkflowViewComponentController} from './workflow/workflow-view-component.controller';
import {WorkflowRouteController} from './workflow/workflow-route.controller';

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
    EventSchedulingModule,
    FileManagementModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    ProjectManagementModule,
    TagModule,
    TaskModule,
    TaskSchedulingModule,
    WorkflowModule,

    // Application
    EnginedModule,
    RecruitmentModule,
  ],
  controllers: [
    ApplicationExampleController,
    AccountLoginController,
    AccountLogoutController,
    AccountOthersController,
    AccountPasswordController,
    AccountSignupController,
    OrganizationController,
    UserController,
    UserProfileController,
    PermissionController,
    RoleController,

    PlaceController,

    NotificationController,

    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureStackController,
    ProjectElementController,
    ProjectController,

    TagController,

    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
  ],
  providers: [
    // Filters
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 4th priority for all exceptions.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 3rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 2nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
  ],
})
export class ApplicationExampleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
