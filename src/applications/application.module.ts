import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {AwsModule} from '../toolkits/aws/aws.module';
import {ElasticModule} from '../toolkits/elastic/elastic.module';
import {PrismaModule} from '../toolkits/prisma/prisma.module';
import {TokenModule} from '../toolkits/token/token.module';
import {AccountModule} from './account/account.module';
import {EnginedModule} from './engined/engined.module';
import {FileManagementModule} from './fmgmt/fmgmt.module';
import {ProjectManagementModule} from './pmgmt/pmgmt.module';
import {RecruitmentModule} from './recruitment/recruitment.module';
import {AuthenticationGuard} from './account/authentication/authentication.guard';
import {AuthorizationGuard} from './account/authorization/authorization.guard';
import {AllExceptionsFilter} from '../_filter/_all-exceptions.filter';
import {HttpExceptionFilter} from '../_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '../_filter/_prisma-exception.filter';
import {HttpMiddleware} from '../_middleware/_http.middleware';
import {ApplicationController} from './application.controller';

@Module({
  imports: [
    // Toolkits (Global modules)
    AwsModule,
    ElasticModule,
    PrismaModule,
    TokenModule,

    // Application
    AccountModule,
    EnginedModule,
    FileManagementModule,
    ProjectManagementModule,
    RecruitmentModule,
  ],
  providers: [
    //Guards
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 2nd priority guard.

    //Filters
    {provide: APP_FILTER, useClass: AllExceptionsFilter}, // 3rd priority for all exceptions.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 2nd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 1st priority for exceptions thrown by controllers.
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
