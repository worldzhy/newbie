import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {EventCoachController} from './event-coach.controller';
import {CoachService} from './coach.service';
import {CoachInfoUploadController} from './coach-info.controller';

@Module({
  controllers: [
    CoachController,
    EventCoachController,
    CoachInfoUploadController,
  ],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
