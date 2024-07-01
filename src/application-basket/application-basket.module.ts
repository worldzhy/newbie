import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {ApplicationBasketController} from './application-basket.controller';
import {SkuConversionController} from './stock-mgmt/sku-conversion.controller';
import {SkuTrailController} from './stock-mgmt/sku-trail.controller';
import {SkuController} from './stock-mgmt/sku.controller';
import {SpuController} from './stock-mgmt/spu.controller';
import {WarehouseSkuController} from './stock-mgmt/warehouse-sku.controller';
import {WarehouseController} from './stock-mgmt/warehouse.controller';

@Module({
  imports: [FrameworkModule, MicroserviceModule],
  controllers: [
    ApplicationBasketController,
    SkuConversionController,
    SkuTrailController,
    SkuController,
    SpuController,
    WarehouseSkuController,
    WarehouseController,
  ],
})
export class ApplicationBasketModule {}
