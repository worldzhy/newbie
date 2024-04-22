import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {EventCoachController} from './event-coach.controller';
import {CoachInfoController} from './coach-info.controller';
import {CoachInfoService} from './coach-info.service';

@Module({
  controllers: [CoachController, EventCoachController, CoachInfoController],
  providers: [CoachInfoService],
  exports: [CoachInfoService],
})
export class CoachModule {}
