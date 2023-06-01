import {Module} from '@nestjs/common';
import {JobApplicationWorkflowStepController} from './step.controller';
import {JobApplicationWorkflowStepService} from './step.service';

@Module({
  controllers: [JobApplicationWorkflowStepController],
  providers: [JobApplicationWorkflowStepService],
  exports: [JobApplicationWorkflowStepService],
})
export class JobApplicationWorkflowStepModule {}
