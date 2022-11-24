import {Module} from '@nestjs/common';
import {WorkflowStateModule} from './state/state.module';
import {WorkflowStepModule} from './step/step.module';
import {WorkflowController} from './workflow.controller';
import {WorkflowService} from './workflow.service';

@Module({
  imports: [WorkflowStateModule, WorkflowStepModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
