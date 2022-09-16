import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {AwsModule} from '../toolkits/aws/aws.module';
import {ElasticModule} from '../toolkits/elastic/elastic.module';
import {PrismaModule} from '../toolkits/prisma/prisma.module';
import {AccountModule} from './account/account.module';
import {EnginedModule} from './engined/engined.module';
import {ProjectManagementModule} from './pmgmt/pmgmt.module';
import {GlobalAuthGuard} from './account/auth/auth.guard';
import {HttpMiddleware} from '../_middleware/_http.middleware';
import {HttpExceptionFilter} from '../_filter/_http-exception.filter';
import {ApplicationController} from './application.controller';

@Module({
  imports: [
    // Toolkits (Global modules)
    AwsModule,
    ElasticModule,
    PrismaModule,

    // Application
    AccountModule,
    EnginedModule,
    ProjectManagementModule,
  ],
  providers: [
    {provide: APP_FILTER, useClass: HttpExceptionFilter},
    {provide: APP_GUARD, useClass: GlobalAuthGuard},
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
