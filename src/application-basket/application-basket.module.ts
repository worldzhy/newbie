import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';

import {ApplicationBasketController} from './application-basket.controller';
import {SkuConversionController} from './stock-mgmt/sku-conversion.controller';
import {SkuTrailController} from './stock-mgmt/sku-trail.controller';
import {SkuController} from './stock-mgmt/sku.controller';
import {SpuController} from './stock-mgmt/spu.controller';
import {WarehouseSkuController} from './stock-mgmt/warehouse-sku.controller';
import {WarehouseController} from './stock-mgmt/warehouse.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
  ],
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
