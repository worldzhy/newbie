import {Module} from '@nestjs/common';
import {JobApplicationWorkflowFileModule} from './file/file.module';
import {JobApplicationWorkflowNoteModule} from './note/note.module';
import {JobApplicationWorkflowTaskModule} from './task/task.module';
import {JobApplicationWorkflowTrailModule} from './trail/trail.module';
import {JobApplicationWorkflowController} from './workflow.controller';
import {JobApplicationWorkflowService} from './workflow.service';

@Module({
  imports: [
    JobApplicationWorkflowFileModule,
    JobApplicationWorkflowNoteModule,
    JobApplicationWorkflowTaskModule,
    JobApplicationWorkflowTrailModule,
  ],
  controllers: [JobApplicationWorkflowController],
  providers: [JobApplicationWorkflowService],
  exports: [JobApplicationWorkflowService],
})
export class JobApplicationWorkflowModule {}
