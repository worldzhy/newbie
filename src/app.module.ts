import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from './_http/_http.middleware';
import {HttpExceptionFilter} from './_http/_http-exception.filter';
import {AppController} from './app.controller';
import {AccountModule} from './app/account/account.module';
import {AwsModule} from './_aws/_aws.module';
import {CustomLoggerModule} from './_logger/_custom-logger.module';
import {OrganizationModule} from './app/account/organization/organization.module';
import {DataboardModule} from './app/ngind/databoard/databoard.module';
import {DatapipeModule} from './app/ngind/datapipe/datapipe.module';
import {DatasourceModule} from './app/ngind/datasource/datasource.module';
import {ProjectManagementModule} from './app/pmgmt/pmgmt.module';
import {MicroserviceModule} from './microservice/microservice.module';
import {NotificationModule} from './microservice/notification/notification.module';
import {TaskModule} from './microservice/task/task.module';

@Module({
  imports: [
    // Basic modules
    AwsModule,
    CustomLoggerModule,

    // Tool modules
    MicroserviceModule,
    NotificationModule,
    TaskModule,

    // Application modules
    AccountModule,
    OrganizationModule,
    ProjectManagementModule,
    DataboardModule,
    DatapipeModule,
    DatasourceModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
