import {Module} from '@nestjs/common';
import {WorkflowStateModule} from './state/state.module';
import {WorkflowViewModule} from './view/view.module';
import {WorkflowRouteModule} from './route/route.module';

@Module({
  imports: [WorkflowStateModule, WorkflowViewModule, WorkflowRouteModule],
})
export class WorkflowModule {}
