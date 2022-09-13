import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from './_http/_http.middleware';
import {HttpExceptionFilter} from './_http/_http-exception.filter';
import {AppController} from './app.controller';
import {AccountModule} from './products/account/account.module';
import {AwsModule} from './_aws/_aws.module';
import {CustomLoggerModule} from './_logger/_custom-logger.module';
import {OrganizationModule} from './products/account/organization/organization.module';
import {DataboardModule} from './products/engined/databoard/databoard.module';
import {DatasourceModule} from './products/engined/datasource/datasource.module';
import {DatatransModule} from './products/engined/datatrans/datatrans.module';
import {ProjectManagementModule} from './products/pmgmt/pmgmt.module';
import {NotificationModule} from './microservices/notification/notification.module';
import {TaskModule} from './microservices/task/task.module';

@Module({
  imports: [
    // Base modules
    AwsModule,
    CustomLoggerModule,

    // Microservice modules
    NotificationModule,
    TaskModule,

    // Product modules
    AccountModule,
    OrganizationModule,
    ProjectManagementModule,
    DataboardModule,
    DatasourceModule,
    DatatransModule,
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
