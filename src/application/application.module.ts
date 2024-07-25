import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';
import {ApplicationController} from './application.controller';

@Module({
  imports: [FrameworkModule, MicroservicesModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
