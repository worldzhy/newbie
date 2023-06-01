import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationService} from './job-application.service';
import {JobApplicationWorkflowModule} from './workflow/workflow.module';
import {FileManagementController} from './fmgmt/fmgmt.controller';

@Module({
  imports: [JobApplicationWorkflowModule],
  controllers: [JobApplicationController, FileManagementController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
