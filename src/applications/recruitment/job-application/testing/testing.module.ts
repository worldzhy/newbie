import {Module} from '@nestjs/common';
import {JobApplicationTestingWorkflowModule} from './workflow/testing-workflow.module';
import {JobApplicationTestingController} from './testing.controller';
import {JobApplicationTestingService} from './testing.service';
import {WorkflowModule} from 'src/microservices/workflow/workflow.module';

@Module({
  imports: [JobApplicationTestingWorkflowModule, WorkflowModule],
  controllers: [JobApplicationTestingController],
  providers: [JobApplicationTestingService],
  exports: [JobApplicationTestingService],
})
export class JobApplicationTestingModule {}
