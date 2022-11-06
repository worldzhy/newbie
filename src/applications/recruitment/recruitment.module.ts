import {Module} from '@nestjs/common';
import {CandidateModule} from './candidate/candidate.module';
import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';

@Module({
  imports: [CandidateModule, JobModule, JobApplicationModule],
})
export class RecruitmentModule {}
