import {Global, Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {CronService} from './cron.service';
import {CronTaskService} from './cron-task.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService, CronTaskService],
  exports: [CronService, CronTaskService],
})
export class CronTaskModule {}
