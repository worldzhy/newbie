import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {CoachService} from './coach.service';

@Module({
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
