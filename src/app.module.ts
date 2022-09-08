import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from './_http/_http.middleware';
import {HttpExceptionFilter} from './_http/_http-exception.filter';
import {AppController} from './app.controller';
import {AccountModule} from './app/account/account.module';
import {AwsModule} from './_aws/_aws.module';
import {CustomLoggerModule} from './_logger/_custom-logger.module';
import {InfrastructureStackModule} from './app/pmgmt/infrastructure-stack/infrastructure-stack.module';
import {MtracModule} from './app/mtrac/mtrac.module';
import {OrganizationModule} from './app/account/organization/organization.module';
import {ProfileModule} from './app/account/profile/profile.module';
import {ProjectModule} from './app/pmgmt/project/project.module';
import {UserModule} from './app/account/user/user.module';
import {VerificationCodeModule} from './app/account/verification-code/verification-code.module';
import {DataboardModule} from './app/ngind/databoard/databoard.module';
import {DatapipeModule} from './app/ngind/datapipe/datapipe.module';
import {DatasourceModule} from './app/ngind/datasource/datasource.module';

@Module({
  imports: [
    AccountModule,
    AwsModule,
    CustomLoggerModule,
    DataboardModule,
    DatapipeModule,
    DatasourceModule,
    InfrastructureStackModule,
    OrganizationModule,
    MtracModule,
    ProfileModule,
    ProjectModule,
    UserModule,
    VerificationCodeModule,
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
