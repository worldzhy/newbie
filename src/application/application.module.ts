import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from '../_middleware/_http.middleware';
import {HttpExceptionFilter} from '../_filter/_http-exception.filter';
import {ApplicationController} from './application.controller';
import {AccountModule} from './account/account.module';
import {EnginedModule} from './engined/engined.module';
import {ProjectManagementModule} from './pmgmt/pmgmt.module';

@Module({
  imports: [AccountModule, EnginedModule, ProjectManagementModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
