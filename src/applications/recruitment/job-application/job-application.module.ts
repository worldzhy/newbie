import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationService} from './job-application.service';

@Module({
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
