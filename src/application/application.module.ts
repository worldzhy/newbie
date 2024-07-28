import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';
import {ApplicationController} from './application.controller';
import ApplicationConfiguration from './application.config';
import {GateApiModule} from './gateapi/gateapi.module';
import {SchedulingModule} from './scheduling/scheduling.module';

@Module({
  imports: [
    FrameworkModule,
    MicroservicesModule,
    ConfigModule.forRoot({
      load: [ApplicationConfiguration],
    }),
    GateApiModule,
    SchedulingModule,
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
