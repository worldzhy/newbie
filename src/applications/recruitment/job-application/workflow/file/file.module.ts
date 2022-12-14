import {Module} from '@nestjs/common';
import {JobApplicationWorkflowFileController} from './file.controller';
import {JobApplicationWorkflowFileService} from './file.service';

@Module({
  controllers: [JobApplicationWorkflowFileController],
  providers: [JobApplicationWorkflowFileService],
  exports: [JobApplicationWorkflowFileService],
})
export class JobApplicationWorkflowFileModule {}
