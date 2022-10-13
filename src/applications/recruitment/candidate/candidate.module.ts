import {Module} from '@nestjs/common';
import {CandidateController} from './candidate.controller';
import {CandidateService} from './candidate.service';

@Module({
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
