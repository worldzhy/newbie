import {Module} from '@nestjs/common';
import {FrameworkModule} from '#framework/framework.module.js';
import {MicroservicesModule} from '#microservices/microservices.module.js';
import {ApplicationController} from './application.controller.js';

@Module({
  imports: [FrameworkModule, MicroservicesModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
