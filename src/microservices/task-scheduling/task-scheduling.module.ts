import {Global, Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {CronTaskService} from './cron/cron.service';
import {TimeoutTaskService} from './timeout/timeout.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronTaskService, TimeoutTaskService],
  exports: [CronTaskService, TimeoutTaskService],
})
export class TaskSchedulingModule {}
