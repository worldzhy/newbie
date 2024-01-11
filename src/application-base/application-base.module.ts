import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';

import {AllExceptionFilter} from '@_filter/_all-exception.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

// Toolkit and microservice modules
import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {GoogleAPIsModule} from '@microservices/googleapis/googleapis.module';
import {FileManagementModule} from '@microservices/file-mgmt/file-mgmt.module';
import {MapModule} from '@microservices/map/map.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/order-mgmt/order-mgmt.module';
import {ProjectManagementModule} from '@microservices/project-mgmt/project-mgmt.module';
import {QueueModule} from '@microservices/queue/queue.module';
import {StockManagementModule} from '@microservices/stock-mgmt/stock-mgmt.module';
import {TagModule} from '@microservices/tag/tag.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';

// Toolkit and microservice controllers
import {AccountController} from './account/account.controller';
import {LoginByPasswordController} from './account/login-by-password.controller';
import {LoginByProfileController} from './account/login-by-profile.controller';
import {LoginByVerificationCodeController} from './account/login-by-verificationcode.controller';
import {LoginRefreshController} from './account/login-refresh.controller';
import {LogoutController} from './account/logout.controller';
import {SignupController} from './account/signup.controller';
import {OrganizationController} from './account/organization/organization.controller';
import {PermissionController} from './account/permission/permission.controller';
import {RoleController} from './account/role/role.controller';
import {UserController} from './account/user/user.controller';
import {TagController} from './tag/tag.controller';
import {TagGroupController} from './tag/tag-group.controller';
import {WorkflowController} from '../application-base/workflow/workflow.controller';
import {WorkflowStateController} from '../application-base/workflow/workflow-state.controller';
import {WorkflowViewController} from '../application-base/workflow/workflow-view.controller';
import {WorkflowViewComponentController} from '../application-base/workflow/workflow-view-component.controller';
import {WorkflowRouteController} from '../application-base/workflow/workflow-route.controller';

@Module({
  imports: [
    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    AccountModule,
    EventSchedulingModule,
    GoogleAPIsModule,
    FileManagementModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    ProjectManagementModule,
    QueueModule,
    StockManagementModule,
    TagModule,
    WorkflowModule,
  ],
  controllers: [
    AccountController,
    LoginByPasswordController,
    LoginByProfileController,
    LoginByVerificationCodeController,
    LoginRefreshController,
    LogoutController,
    SignupController,
    // OrganizationController,
    // PermissionController,
    // RoleController,
    // UserController,
    TagController,
    TagGroupController,
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
export class ApplicationBaseModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
