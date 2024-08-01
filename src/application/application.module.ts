import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';
import {ToolkitModule} from '@toolkit/toolkit.module';
import {ApplicationController} from './application.controller';

@Module({
  imports: [FrameworkModule, MicroservicesModule, ToolkitModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
