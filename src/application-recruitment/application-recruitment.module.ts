import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';
import {CandidateCertificationModule} from './certification/certification.module';
import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';

@Module({
  imports: [
    Application0Module, // Hope you enjoy the Newbie!
    CandidateCertificationModule,
    JobModule,
    JobApplicationModule,
  ],
})
export class ApplicationRecruitmentModule {}
