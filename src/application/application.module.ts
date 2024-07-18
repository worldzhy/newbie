import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';
import {ApplicationController} from './application.controller';

@Module({
  imports: [FrameworkModule, MicroserviceModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
