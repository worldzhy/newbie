import {Global, Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AsyncPublishService} from './async-publish.service';
import {ScheduleService} from './schedule.service';
import {EventController} from './schedule-class.controller';
import {EventCopyController} from './schedule-import.controller';
import {EventContainerController} from './schedule.controller';
import {CoachModule} from '../coach/coach.module';
import {RawDataModule} from '../raw-data/raw-data.module';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot(), CoachModule, RawDataModule],
  controllers: [EventController, EventCopyController, EventContainerController],
  providers: [AsyncPublishService, ScheduleService],
  exports: [AsyncPublishService, ScheduleService],
})
export class SchedulingModule {}
