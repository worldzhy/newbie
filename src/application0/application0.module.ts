import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';

import {AllExceptionFilter} from './_filter/_all-exception.filter';
import {HttpExceptionFilter} from './_filter/_http-exception.filter';
import {PrismaExceptionFilter} from './_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from './_filter/_throttler-exception.filter';
import {HttpMiddleware} from './_middleware/_http.middleware';

// Toolkit and microservice modules
import {MicroserviceModule} from '@microservices/microservice.module';

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
import {ProfileController} from './account/user/profile.controller';
import {GoogleDriveController} from './file-mgmt/google-drive.controller';
import {NotificationController} from './notification/notification.controller';
import {TagController} from './tag/tag.controller';
import {TagGroupController} from './tag/tag-group.controller';
import {WorkflowController} from './workflow/workflow.controller';
import {WorkflowStateController} from './workflow/workflow-state.controller';
import {WorkflowViewController} from './workflow/workflow-view.controller';
import {WorkflowViewComponentController} from './workflow/workflow-view-component.controller';
import {WorkflowRouteController} from './workflow/workflow-route.controller';
import ApplicationConfiguration from 'src/config';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({load: [ApplicationConfiguration]}),
    // Microservices (Global modules)
    MicroserviceModule,
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
    ProfileController,
    GoogleDriveController,
    NotificationController,
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
export class Application0Module {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
