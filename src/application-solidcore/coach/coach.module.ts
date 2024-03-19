import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {EventCoachController} from './event-coach.controller';
import {CoachInfoUploadController} from './coach-sheet.controller';

@Module({
  controllers: [
    CoachController,
    EventCoachController,
    CoachInfoUploadController,
  ],
})
export class CoachModule {}
