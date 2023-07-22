import {Module} from '@nestjs/common';
import {CandidateController} from './candidate/candidate.controller';
import {CandidateProfileController} from './candidate/profile/profile.controller';
import {CandidateCertificationController} from './candidate/certification/certification.controller';
import {CandidateTrainingController} from './candidate/training/training.controller';
import {JobController} from './job/job.controller';
import {JobApplicationController} from './job-application/job-application.controller';
import {JobApplicationWorkflowController} from './job-application/workflow/workflow.controller';
import {JobApplicationWorkflowFileController} from './job-application/workflow/file/file.controller';
import {JobApplicationWorkflowNoteController} from './job-application/workflow/note/note.controller';
import {JobApplicationWorkflowTaskController} from './job-application/workflow/task/task.controller';
import {JobApplicationWorkflowTrailController} from './job-application/workflow/trail/trail.controller';
import {CandidateService} from './candidate/candidate.service';
import {JobService} from './job/job.service';
import {JobApplicationService} from './job-application/job-application.service';
import {CandidateProfileService} from './candidate/profile/profile.service';
import {CandidateCertificationService} from './candidate/certification/certification.service';
import {CandidateTrainingService} from './candidate/training/training.service';
import {JobApplicationWorkflowService} from './job-application/workflow/workflow.service';
import {JobApplicationWorkflowFileService} from './job-application/workflow/file/file.service';
import {JobApplicationWorkflowNoteService} from './job-application/workflow/note/note.service';
import {JobApplicationWorkflowTaskService} from './job-application/workflow/task/task.service';
import {JobApplicationWorkflowTrailService} from './job-application/workflow/trail/trail.service';

@Module({
  controllers: [
    CandidateController,
    CandidateProfileController,
    CandidateCertificationController,
    CandidateTrainingController,
    JobController,
    JobApplicationController,
    JobApplicationWorkflowController,
    JobApplicationWorkflowFileController,
    JobApplicationWorkflowNoteController,
    JobApplicationWorkflowTaskController,
    JobApplicationWorkflowTrailController,
  ],
  providers: [
    CandidateService,
    CandidateProfileService,
    CandidateCertificationService,
    CandidateTrainingService,
    JobService,
    JobApplicationService,
    JobApplicationWorkflowService,
    JobApplicationWorkflowFileService,
    JobApplicationWorkflowNoteService,
    JobApplicationWorkflowTaskService,
    JobApplicationWorkflowTrailService,
  ],
  exports: [
    CandidateService,
    CandidateProfileService,
    CandidateCertificationService,
    CandidateTrainingService,
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
