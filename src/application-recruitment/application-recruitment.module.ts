import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';
import {CandidateCertificationModule} from './certification/certification.module';
import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';
import {ApplicationRecruitmentController} from './application-recruitment.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
    CandidateCertificationModule,
    JobModule,
    JobApplicationModule,
  ],
  controllers: [ApplicationRecruitmentController],
})
export class ApplicationRecruitmentModule {}
