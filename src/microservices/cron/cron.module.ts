import {Global, Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {CronTaskService} from './cron-task.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronTaskService],
  exports: [CronTaskService],
})
export class CronTaskModule {}
