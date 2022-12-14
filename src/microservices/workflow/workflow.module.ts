import {Module} from '@nestjs/common';
import {WorkflowStateModule} from './state/state.module';
import {WorkflowStepModule} from './step/step.module';
import {WorkflowRouteModule} from './route/route.module';

@Module({
  imports: [WorkflowStateModule, WorkflowStepModule, WorkflowRouteModule],
})
export class WorkflowModule {}
