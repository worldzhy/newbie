import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationWorkflowController} from './workflow/workflow.controller';
import {JobApplicationWorkflowFileController} from './workflow/file.controller';
import {JobApplicationWorkflowNoteController} from './workflow/note.controller';
import {JobApplicationWorkflowTaskController} from './workflow/task.controller';
import {JobApplicationWorkflowTrailController} from './workflow/trail.controller';
import {JobApplicationWorkflowService} from './workflow/workflow.service';

@Module({
  controllers: [
    JobApplicationController,
    JobApplicationWorkflowController,
    JobApplicationWorkflowFileController,
    JobApplicationWorkflowNoteController,
    JobApplicationWorkflowTaskController,
    JobApplicationWorkflowTrailController,
  ],
  providers: [JobApplicationWorkflowService],
  exports: [JobApplicationWorkflowService],
})
export class JobApplicationModule {}
