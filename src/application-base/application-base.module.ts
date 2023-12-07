import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';

import {AllExceptionFilter} from '@_filter/_all-exception.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {FileManagementModule} from '@microservices/file-mgmt/file-mgmt.module';
import {MapModule} from '@microservices/map/map.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/order-mgmt/order-mgmt.module';
import {ProjectManagementModule} from '@microservices/project-mgmt/project-mgmt.module';
import {QueueModule} from '@microservices/queue/queue.module';
import {TagModule} from '@microservices/tag/tag.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';

import {EnginedModule} from './engined/engined.module';
import {RecruitmentModule} from './recruitment/recruitment.module';
import {ApplicationBaseController} from './application-base.controller';
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
import {ProjectCheckpointController} from './project-mgmt/checkpoint.controller';
import {ProjectEnvironmentController} from './project-mgmt/environment.controller';
import {ProjectInfrastructureStackController} from './project-mgmt/infrastructure-stack.controller';
import {ProjectElementController} from './project-mgmt/project-element.controller';
import {ProjectController} from './project-mgmt/project.controller';
import {WorkflowController} from './workflow/workflow.controller';
import {WorkflowStateController} from './workflow/workflow-state.controller';
import {WorkflowViewController} from './workflow/workflow-view.controller';
import {WorkflowViewComponentController} from './workflow/workflow-view-component.controller';
import {WorkflowRouteController} from './workflow/workflow-route.controller';

@Module({
  imports: [
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
    QueueModule,
    TagModule,
    WorkflowModule,

    // Application
    EnginedModule,
    RecruitmentModule,
  ],
  controllers: [
    ApplicationBaseController,
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
