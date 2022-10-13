import {Module} from '@nestjs/common';
import {JobApplicationNoteController} from './note.controller';
import {JobApplicationNoteService} from './note.service';

@Module({
  controllers: [JobApplicationNoteController],
  providers: [JobApplicationNoteService],
  exports: [JobApplicationNoteService],
})
export class JobApplicationNoteModule {}
