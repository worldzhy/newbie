import {Module} from '@nestjs/common';
import {CronController} from './cron.controller';

@Module({
  controllers: [CronController],
})
export class AppCronModule {}
