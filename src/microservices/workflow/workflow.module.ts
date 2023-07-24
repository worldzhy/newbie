import {Global, Module} from '@nestjs/common';
import {WorkflowService} from './workflow.service';
import {WorkflowStateService} from './workflow-state.service';
import {WorkflowViewService} from './workflow-view.service';
import {WorkflowViewComponentService} from './workflow-view-component.service';
import {WorkflowRouteService} from './workflow-route.service';

@Global()
@Module({
  providers: [
    WorkflowService,
    WorkflowStateService,
    WorkflowViewService,
    WorkflowViewComponentService,
    WorkflowRouteService,
  ],
  exports: [
    WorkflowService,
    WorkflowStateService,
    WorkflowViewService,
    WorkflowViewComponentService,
    WorkflowRouteService,
  ],
})
export class WorkflowModule {}
