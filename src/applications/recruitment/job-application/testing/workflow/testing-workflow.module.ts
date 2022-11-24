import {Module} from '@nestjs/common';
import {JobApplicationTestingWorkflowController} from './testing-workflow.controller';
import {JobApplicationTestingWorkflowService} from './testing-workflow.service';

@Module({
  controllers: [JobApplicationTestingWorkflowController],
  providers: [JobApplicationTestingWorkflowService],
  exports: [JobApplicationTestingWorkflowService],
})
export class JobApplicationTestingWorkflowModule {}
