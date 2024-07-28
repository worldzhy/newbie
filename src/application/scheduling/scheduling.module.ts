import {Module} from '@nestjs/common';
import {SchedulingController} from './scheduling.controller';
import {CronJobProducer} from './scheduling.producer';
import {GateApiModule} from '../gateapi/gateapi.module';

@Module({
  imports: [GateApiModule],
  controllers: [SchedulingController],
  providers: [CronJobProducer],
  // exports: [CronJobProducer],
})
export class SchedulingModule {}
