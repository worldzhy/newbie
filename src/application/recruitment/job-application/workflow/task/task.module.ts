import {Module} from '@nestjs/common';
import {JobApplicationWorkflowTaskController} from './task.controller';
import {JobApplicationWorkflowTaskService} from './task.service';

@Module({
  controllers: [JobApplicationWorkflowTaskController],
  providers: [JobApplicationWorkflowTaskService],
  exports: [JobApplicationWorkflowTaskService],
})
export class JobApplicationWorkflowTaskModule {}
