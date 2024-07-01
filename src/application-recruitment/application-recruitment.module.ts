import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {JobModule} from './job/job.module';
import {JobApplicationModule} from './job-application/job-application.module';
import {ApplicationRecruitmentController} from './application-recruitment.controller';

@Module({
  imports: [
    FrameworkModule,
    MicroserviceModule,

    JobModule,
    JobApplicationModule,
  ],
  controllers: [ApplicationRecruitmentController],
})
export class ApplicationRecruitmentModule {}
