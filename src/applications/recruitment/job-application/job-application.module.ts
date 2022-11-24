import {Module} from '@nestjs/common';
import {JobApplicationController} from './job-application.controller';
import {JobApplicationService} from './job-application.service';
import {JobApplicationNoteModule} from './note/note.module';
import {JobApplicationTaskModule} from './task/task.module';
import {JobApplicationTestingModule} from './testing/testing.module';

@Module({
  imports: [
    JobApplicationNoteModule,
    JobApplicationTaskModule,
    JobApplicationTestingModule,
  ],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
