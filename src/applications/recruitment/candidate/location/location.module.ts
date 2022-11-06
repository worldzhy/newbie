import {Module} from '@nestjs/common';
import {CandidateLocationController} from './location.controller';
import {CandidateLocationService} from './location.service';

@Module({
  controllers: [CandidateLocationController],
  providers: [CandidateLocationService],
  exports: [CandidateLocationService],
})
export class CandidateLocationModule {}
