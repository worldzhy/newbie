import {Module} from '@nestjs/common';
import {CertificationController} from './certification/certification.controller';
import {JobController} from './job/job.controller';
import {JobApplicationController} from './job-application/job-application.controller';
import {JobApplicationWorkflowController} from './job-application/workflow/workflow.controller';
import {JobApplicationWorkflowFileController} from './job-application/workflow/file/file.controller';
import {JobApplicationWorkflowNoteController} from './job-application/workflow/note/note.controller';
import {JobApplicationWorkflowTaskController} from './job-application/workflow/task/task.controller';
import {JobApplicationWorkflowTrailController} from './job-application/workflow/trail/trail.controller';
import {JobService} from './job/job.service';
import {JobApplicationService} from './job-application/job-application.service';
import {CertificationService} from './certification/certification.service';
import {JobApplicationWorkflowService} from './job-application/workflow/workflow.service';
import {JobApplicationWorkflowFileService} from './job-application/workflow/file/file.service';
import {JobApplicationWorkflowNoteService} from './job-application/workflow/note/note.service';
import {JobApplicationWorkflowTaskService} from './job-application/workflow/task/task.service';
import {JobApplicationWorkflowTrailService} from './job-application/workflow/trail/trail.service';

@Module({
  controllers: [
    CertificationController,
    JobController,
    JobApplicationController,
    JobApplicationWorkflowController,
    JobApplicationWorkflowFileController,
    JobApplicationWorkflowNoteController,
    JobApplicationWorkflowTaskController,
    JobApplicationWorkflowTrailController,
  ],
  providers: [
    CertificationService,
    JobService,
    JobApplicationService,
    JobApplicationWorkflowService,
    JobApplicationWorkflowFileService,
    JobApplicationWorkflowNoteService,
    JobApplicationWorkflowTaskService,
    JobApplicationWorkflowTrailService,
  ],
  exports: [
    CertificationService,
    JobService,
    JobApplicationService,
    JobApplicationWorkflowService,
    JobApplicationWorkflowFileService,
    JobApplicationWorkflowNoteService,
    JobApplicationWorkflowTaskService,
    JobApplicationWorkflowTrailService,
  ],
})
export class RecruitmentModule {}
