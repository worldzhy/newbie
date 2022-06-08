import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {HttpMiddleware} from './_http/_http.middleware';
import {HttpExceptionFilter} from './_http/_http-exception.filter';
import {AppController} from './app.controller';
import {AccountModule} from './app/account/account.module';
import {AwsModule} from './_aws/_aws.module';
import {CustomLoggerModule} from './_logger/_custom-logger.module';
import {InfrastructureStackModule} from './app/project/infrastructure-stack/infrastructure-stack.module';
import {OrganizationModule} from './app/account/organization/organization.module';
import {ProfileModule} from './app/account/profile/profile.module';
import {ProjectModule} from './app/project/project.module';
import {QueueModule} from './_queue/_queue.module';
import {UserModule} from './app/account/user/user.module';
import {ValidatorModule} from './_validator/_validator.module';
import {VerificationCodeModule} from './app/account/verification-code/verification-code.module';

@Module({
  imports: [
    AccountModule,
    AwsModule,
    CustomLoggerModule,
    InfrastructureStackModule,
    OrganizationModule,
    ProfileModule,
    ProjectModule,
    QueueModule,
    UserModule,
    ValidatorModule,
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
