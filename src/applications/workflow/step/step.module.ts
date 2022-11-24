import {Module} from '@nestjs/common';
import {WorkflowStepController} from './step.controller';
import {WorkflowStepService} from './step.service';

@Module({
  controllers: [WorkflowStepController],
  providers: [WorkflowStepService],
  exports: [WorkflowStepService],
})
export class WorkflowStepModule {}
