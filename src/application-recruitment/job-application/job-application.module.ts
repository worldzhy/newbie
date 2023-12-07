import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationWorkflowController} from './workflow/workflow.controller';
import {JobApplicationWorkflowFileController} from './workflow/file/file.controller';
import {JobApplicationWorkflowNoteController} from './workflow/note/note.controller';
import {JobApplicationWorkflowTaskController} from './workflow/task/task.controller';
import {JobApplicationWorkflowTrailController} from './workflow/trail/trail.controller';
import {JobApplicationService} from './job-application.service';
import {JobApplicationWorkflowService} from './workflow/workflow.service';
import {JobApplicationWorkflowFileService} from './workflow/file/file.service';
import {JobApplicationWorkflowNoteService} from './workflow/note/note.service';
import {JobApplicationWorkflowTaskService} from './workflow/task/task.service';
import {JobApplicationWorkflowTrailService} from './workflow/trail/trail.service';

@Module({
  controllers: [
    JobApplicationController,
    JobApplicationWorkflowController,
    JobApplicationWorkflowFileController,
    JobApplicationWorkflowNoteController,
    JobApplicationWorkflowTaskController,
    JobApplicationWorkflowTrailController,
  ],
  providers: [
    JobApplicationService,
    JobApplicationWorkflowService,
    JobApplicationWorkflowFileService,
    JobApplicationWorkflowNoteService,
    JobApplicationWorkflowTaskService,
    JobApplicationWorkflowTrailService,
  ],
  exports: [
    JobApplicationService,
    JobApplicationWorkflowService,
    JobApplicationWorkflowFileService,
    JobApplicationWorkflowNoteService,
    JobApplicationWorkflowTaskService,
    JobApplicationWorkflowTrailService,
  ],
})
export class JobApplicationModule {}
