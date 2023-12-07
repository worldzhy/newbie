import {Global, Module} from '@nestjs/common';
import {AsyncPublishService} from './async-publish.service';
import {EventChangeLogController} from './schedule-class-changelog.controller';
import {EventController} from './schedule-class.controller';
import {EventFixController} from './schedule-fix.controller';
import {EventCopyController} from './schedule-import.controller';
import {EventContainerController} from './schedule.controller';
import {CoachModule} from '../coach/coach.module';
import {RawDataModule} from '../raw-data/raw-data.module';

@Global()
@Module({
  imports: [CoachModule, RawDataModule],
  controllers: [
    EventChangeLogController,
    EventController,
    EventFixController,
    EventCopyController,
    EventContainerController,
  ],
  providers: [AsyncPublishService],
  exports: [AsyncPublishService],
})
export class SchedulingModule {}
