import {Module} from '@nestjs/common';
import {CandidateTrainingController} from './training.controller';
import {CandidateTrainingService} from './training.service';

@Module({
  controllers: [CandidateTrainingController],
  providers: [CandidateTrainingService],
  exports: [CandidateTrainingService],
})
export class CandidateTrainingModule {}
