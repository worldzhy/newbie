import {Module} from '@nestjs/common';
import {ApplicationBaseModule} from '@application-base/application-base.module';

import {EnginedModule} from './engined/engined.module';

import {ApplicationDemoController} from './application-demo.controller';
import {ProjectCheckpointController} from './project-mgmt/checkpoint.controller';
import {ProjectEnvironmentController} from './project-mgmt/environment.controller';
import {ProjectInfrastructureStackController} from './project-mgmt/infrastructure-stack.controller';
import {ProjectElementController} from './project-mgmt/project-element.controller';
import {ProjectController} from './project-mgmt/project.controller';

import {SkuConversionController} from './stock-mgmt/sku-conversion.controller';
import {SkuTrailController} from './stock-mgmt/sku-trail.controller';
import {SkuController} from './stock-mgmt/sku.controller';
import {SpuController} from './stock-mgmt/spu.controller';
import {WarehouseSkuController} from './stock-mgmt/warehouse-sku.controller';
import {WarehouseController} from './stock-mgmt/warehouse.controller';

import {WorkflowController} from './workflow/workflow.controller';
import {WorkflowStateController} from './workflow/workflow-state.controller';
import {WorkflowViewController} from './workflow/workflow-view.controller';
import {WorkflowViewComponentController} from './workflow/workflow-view-component.controller';
import {WorkflowRouteController} from './workflow/workflow-route.controller';

@Module({
  imports: [
    ApplicationBaseModule, // Hope you enjoy the Newbie!
    EnginedModule,
  ],
  controllers: [
    ApplicationDemoController,

    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureStackController,
    ProjectElementController,
    ProjectController,

    SkuConversionController,
    SkuTrailController,
    SkuController,
    SpuController,
    WarehouseSkuController,
    WarehouseController,

    WorkflowController,
    WorkflowStateController,
    WorkflowViewController,
    WorkflowViewComponentController,
    WorkflowRouteController,
  ],
})
export class ApplicationDemoModule {}
