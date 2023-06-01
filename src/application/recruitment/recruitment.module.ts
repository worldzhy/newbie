import {Module} from '@nestjs/common';
import {CandidateController} from './candidate/candidate.controller';
import {CandidateProfileController} from './candidate/profile/profile.controller';
import {CandidateCertificationController} from './candidate/certification/certification.controller';
import {CandidateTrainingController} from './candidate/training/training.controller';
import {JobController} from './job/job.controller';
import {JobApplicationController} from './job-application/job-application.controller';
import {CandidateService} from './candidate/candidate.service';
import {JobService} from './job/job.service';
import {JobApplicationService} from './job-application/job-application.service';
import {CandidateProfileService} from './candidate/profile/profile.service';
import {CandidateCertificationService} from './candidate/certification/certification.service';
import {CandidateTrainingService} from './candidate/training/training.service';

@Module({
  controllers: [
    CandidateController,
    CandidateProfileController,
    CandidateCertificationController,
    CandidateTrainingController,
    JobController,
    JobApplicationController,
  ],
  providers: [
    CandidateService,
    CandidateProfileService,
    CandidateCertificationService,
    CandidateTrainingService,
    JobService,
    JobApplicationService,
  ],
  exports: [
    CandidateService,
    CandidateProfileService,
    CandidateCertificationService,
    CandidateTrainingService,
    JobService,
    JobApplicationService,
  ],
})
export class RecruitmentModule {}
