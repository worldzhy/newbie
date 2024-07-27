import {Module} from '@nestjs/common';
import {CronController} from './cron.controller';
import {CronJobProducer} from './cron.producer';
import {GateModule} from '../gate/gate.module';

@Module({
  imports: [GateModule],
  controllers: [CronController, CronJobProducer],
})
export class CronModule {}
