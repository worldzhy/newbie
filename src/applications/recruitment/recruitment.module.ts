import {Module} from '@nestjs/common';
import {CandidateModule} from './candidate/candidate.module';
import {CandidateCertificationModule} from './candidate/certification/certification.module';
import {CandidateTrainingModule} from './candidate/training/training.module';
import {CandidateTestingModule} from './candidate/testing/testing.module';
import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';
import {JobApplicationNoteModule} from './job-application/note/note.module';
import {JobApplicationTaskModule} from './job-application/task/task.module';
import {ProcessingStepModule} from './job-application/processing-step/processing-step.module';

@Module({
  imports: [
    CandidateModule,
    CandidateCertificationModule,
    CandidateTrainingModule,
    CandidateTestingModule,
    JobModule,
    JobApplicationModule,
    JobApplicationNoteModule,
    JobApplicationTaskModule,
    ProcessingStepModule,
  ],
})
export class RecruitmentModule {}
