import {Module} from '@nestjs/common';
import {JobApplicationWorkflowNoteController} from './note.controller';
import {JobApplicationWorkflowNoteService} from './note.service';

@Module({
  controllers: [JobApplicationWorkflowNoteController],
  providers: [JobApplicationWorkflowNoteService],
  exports: [JobApplicationWorkflowNoteService],
})
export class JobApplicationWorkflowNoteModule {}
