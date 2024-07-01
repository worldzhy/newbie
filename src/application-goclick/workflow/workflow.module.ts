import {Module} from '@nestjs/common';
import {WorkflowController} from './workflow.controller';
import {WorkflowStateController} from './workflow-state.controller';
import {WorkflowViewController} from './workflow-view.controller';
import {WorkflowViewComponentController} from './workflow-view-component.controller';
import {WorkflowRouteController} from './workflow-route.controller';

@Module({
  controllers: [
    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
  ],
})
export class AppWorkflowModule {}
