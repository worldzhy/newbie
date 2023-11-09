import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {EventCoachController} from './event-coach.controller';
import {CoachService} from './coach.service';

@Module({
  controllers: [CoachController, EventCoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
