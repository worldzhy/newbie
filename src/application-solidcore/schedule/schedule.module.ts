import {Global, Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AsyncPublishService} from './async-publish.service';
import {EventController} from './schedule-class.controller';
import {EventFixController} from './schedule-fix.controller';
import {EventCopyController} from './schedule-import.controller';
import {EventContainerController} from './schedule.controller';
import {CoachModule} from '../coach/coach.module';
import {RawDataModule} from '../raw-data/raw-data.module';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot(), CoachModule, RawDataModule],
  controllers: [
    EventController,
    EventFixController,
    EventCopyController,
    EventContainerController,
  ],
  providers: [AsyncPublishService],
  exports: [AsyncPublishService],
})
export class SchedulingModule {}
