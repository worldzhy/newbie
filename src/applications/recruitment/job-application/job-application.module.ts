import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationService} from './job-application.service';
import {JobApplicationNoteModule} from './note/note.module';
import {JobApplicationTaskModule} from './task/task.module';
import {ProcessingStepModule} from './processing-step/processing-step.module';

@Module({
  imports: [
    JobApplicationNoteModule,
    JobApplicationTaskModule,
    ProcessingStepModule,
  ],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
