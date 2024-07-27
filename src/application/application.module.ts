import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';
import {ApplicationController} from './application.controller';
import ApplicationConfiguration from './application.config';

@Module({
  imports: [
    FrameworkModule,
    MicroservicesModule,
    ConfigModule.forRoot({
      load: [ApplicationConfiguration],
    }),
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
