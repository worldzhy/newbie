import {Module} from '@nestjs/common';
import {WorkflowController} from './workflow.controller';
import {WorkflowStateController} from './state/state.controller';
import {WorkflowViewController} from './view/view.controller';
import {WorkflowRouteController} from './route/route.controller';
import {WorkflowService} from './workflow.service';
import {WorkflowStateService} from './state/state.service';
import {WorkflowViewService} from './view/view.service';
import {WorkflowRouteService} from './route/route.service';

@Module({
  controllers: [
    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowRouteController,
  ],
  providers: [
    WorkflowService,
    WorkflowStateService,
    WorkflowViewService,
    WorkflowRouteService,
  ],
  exports: [
    WorkflowService,
    WorkflowStateService,
    WorkflowViewService,
    WorkflowRouteService,
  ],
})
export class WorkflowModule {}
