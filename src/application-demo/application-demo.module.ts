import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';

import {EnginedModule} from './engined/engined.module';

import {ApplicationDemoController} from './application-demo.controller';
import {ProjectCheckpointController} from './project-mgmt/checkpoint.controller';
import {ProjectEnvironmentController} from './project-mgmt/environment.controller';
import {ProjectInfrastructureController} from './project-mgmt/infrastructure.controller';
import {ProjectNoteController} from './project-mgmt/note.controller';
import {ProjectController} from './project-mgmt/project.controller';

import {SkuConversionController} from './stock-mgmt/sku-conversion.controller';
import {SkuTrailController} from './stock-mgmt/sku-trail.controller';
import {SkuController} from './stock-mgmt/sku.controller';
import {SpuController} from './stock-mgmt/spu.controller';
import {WarehouseSkuController} from './stock-mgmt/warehouse-sku.controller';
import {WarehouseController} from './stock-mgmt/warehouse.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
    EnginedModule,
  ],
  controllers: [
    ApplicationDemoController,

    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureController,
    ProjectNoteController,
    ProjectController,

    SkuConversionController,
    SkuTrailController,
    SkuController,
    SpuController,
    WarehouseSkuController,
    WarehouseController,
  ],
})
export class ApplicationDemoModule {}
