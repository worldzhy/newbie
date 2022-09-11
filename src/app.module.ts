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
import {DatapipeModule} from './product/engined/datapipe/datapipe.module';
import {DatasourceModule} from './product/engined/datasource/datasource.module';
import {ProjectManagementModule} from './product/pmgmt/pmgmt.module';
import {MicroserviceModule} from './microservice/microservice.module';
import {NotificationModule} from './microservice/notification/notification.module';
import {TaskModule} from './microservice/task/task.module';

@Module({
  imports: [
    // Base modules
    AwsModule,
    CustomLoggerModule,

    // Microservice modules
    MicroserviceModule,
    NotificationModule,
    TaskModule,

    // Product modules
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
