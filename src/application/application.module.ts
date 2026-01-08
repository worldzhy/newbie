import {Module} from '@nestjs/common';
import {ApplicationController} from './application.controller.js';
import {FrameworkModule} from '../framework/framework.module.js';
import {MicroservicesModule} from '../microservices/microservices.module.js';

@Module({
  imports: [FrameworkModule, MicroservicesModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
