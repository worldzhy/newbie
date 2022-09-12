import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from './_http/_http.middleware';
import {HttpExceptionFilter} from './_http/_http-exception.filter';
import {AppController} from './app.controller';
import {AccountModule} from './product/account/account.module';
import {AwsModule} from './_aws/_aws.module';
import {CustomLoggerModule} from './_logger/_custom-logger.module';
import {OrganizationModule} from './product/account/organization/organization.module';
import {DataboardModule} from './product/engined/databoard/databoard.module';
import {DatasourceModule} from './product/engined/datasource/datasource.module';
import {DatatransModule} from './product/engined/datatrans/datatrans.module';
import {ProjectManagementModule} from './product/pmgmt/pmgmt.module';
import {NotificationModule} from './microservice/notification/notification.module';
import {TaskManagementModule} from './microservice/task-mgmt/task-mgmt.module';

@Module({
  imports: [
    // Base modules
    AwsModule,
    CustomLoggerModule,

    // Microservice modules
    NotificationModule,
    TaskManagementModule,

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
