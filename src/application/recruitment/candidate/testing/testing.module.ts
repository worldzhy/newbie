import {Module} from '@nestjs/common';
import {CandidateTestingController} from './testing.controller';
import {CandidateTestingService} from './testing.service';

@Module({
  controllers: [CandidateTestingController],
  providers: [CandidateTestingService],
  exports: [CandidateTestingService],
})
export class CandidateTestingModule {}
