import {Module} from '@nestjs/common';
import {WorkflowStateModule} from './state/state.module';
import {WorkflowViewModule} from './view/view.module';
import {WorkflowRouteModule} from './route/route.module';
import {WorkflowService} from './workflow.service';

@Module({
  imports: [WorkflowStateModule, WorkflowViewModule, WorkflowRouteModule],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
