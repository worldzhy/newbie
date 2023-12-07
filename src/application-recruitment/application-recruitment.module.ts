import {Module} from '@nestjs/common';
import {ApplicationBaseModule} from '@application-base/application-base.module';
import {CandidateCertificationModule} from './certification/certification.module';
import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';

@Module({
  imports: [
    ApplicationBaseModule, // Hope you enjoy the Newbie!
    CandidateCertificationModule,
    JobModule,
    JobApplicationModule,
  ],
})
export class ApplicationRecruitmentModule {}
