import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {AllExceptionFilter} from '../toolkit/nestjs/exception-filter/all.exception-filter';
import {HttpExceptionFilter} from '../toolkit/nestjs/exception-filter/http.exception-filter';
import {PrismaExceptionFilter} from '../toolkit/nestjs/exception-filter/prisma.exception-filter';
import {ThrottlerExceptionFilter} from '../toolkit/nestjs/exception-filter/throttler.exception-filter';
import {HttpMiddleware} from '../toolkit/nestjs/middleware/http.middleware';
import ApplicationConfiguration from '../config';

// Toolkit and microservice modules
import {MicroserviceModule} from '@microservices/microservice.module';

// Application0 controllers
import {App0AccountModule} from './account/account.module';
import {App0CronModule} from './cron/cron.module';
import {App0EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {App0FileManagementModule} from './file-mgmt/file-mgmt.module';
import {App0NotificationModule} from './notification/notification.module';
import {App0TagModule} from './tag/tag.module';
import {App0WorkflowModule} from './workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [ApplicationConfiguration]}),
    // Microservices (Global modules)
    MicroserviceModule,
    // Application0
    App0AccountModule,
    App0CronModule,
    App0EventSchedulingModule,
    App0FileManagementModule,
    App0NotificationModule,
    App0TagModule,
    App0WorkflowModule,
  ],
  // providers: [
  //   // Filters
  //   {provide: APP_FILTER, useClass: AllExceptionFilter}, // 4th priority for all exceptions.
  //   {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 3rd priority for exceptions thrown by services.
  //   {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 2nd priority for exceptions thrown by controllers.
  //   {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
  // ],
})
export class Application0Module {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
