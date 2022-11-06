import {Module} from '@nestjs/common';
import {CandidateController} from './candidate.controller';
import {CandidateService} from './candidate.service';
import {CandidateLocationModule} from './location/location.module';
import {CandidateProfileModule} from './profile/profile.module';
import {CandidateCertificationModule} from './certification/certification.module';
import {CandidateTestingModule} from './testing/testing.module';
import {CandidateTrainingModule} from './training/training.module';

@Module({
  imports: [
    CandidateLocationModule,
    CandidateProfileModule,
    CandidateCertificationModule,
    CandidateTestingModule,
    CandidateTrainingModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
