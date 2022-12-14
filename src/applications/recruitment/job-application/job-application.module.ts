import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationService} from './job-application.service';
import {JobApplicationWorkflowModule} from './workflow/workflow.module';

@Module({
  imports: [JobApplicationWorkflowModule],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
