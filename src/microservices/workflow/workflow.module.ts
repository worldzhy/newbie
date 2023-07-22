import {Global, Module} from '@nestjs/common';
import {WorkflowController} from './workflow.controller';
import {WorkflowStateController} from './state/state.controller';
import {WorkflowViewController} from './view/view.controller';
import {WorkflowViewComponentController} from './view/component/component.controller';
import {WorkflowRouteController} from './route/route.controller';
import {WorkflowService} from './workflow.service';
import {WorkflowStateService} from './state/state.service';
import {WorkflowViewService} from './view/view.service';
import {WorkflowViewComponentService} from './view/component/component.service';
import {WorkflowRouteService} from './route/route.service';

@Global()
@Module({
  controllers: [
    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
  ],
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
