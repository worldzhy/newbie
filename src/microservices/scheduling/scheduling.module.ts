import {Global, Module} from '@nestjs/common';
import {SchedulingController} from './scheduling.controller';
import {CronJobService} from './cronjob.service';
import {IntervalService} from './interval.service';
import {TimeoutService} from './timeout.service';

@Global()
@Module({
  controllers: [SchedulingController],
  providers: [CronJobService, IntervalService, TimeoutService],
  exports: [CronJobService, IntervalService, TimeoutService],
})
export class SchedulingModule {}
