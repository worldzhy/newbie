import {Global, Module} from '@nestjs/common';
import {SkuConversionItemService} from './sku-conversion-item.service';
import {SkuConversionService} from './sku-conversion.service';
import {SkuTrailService} from './sku-trail.service';
import {SkuService} from './sku.service';
import {SpuService} from './spu.service';
import {WarehouseSkuService} from './warehouse-sku.service';
import {WarehouseService} from './warehouse.service';

@Global()
@Module({
  providers: [
    SkuConversionItemService,
    SkuConversionService,
    SkuTrailService,
    SkuService,
    SpuService,
    WarehouseSkuService,
    WarehouseService,
  ],
  exports: [
    SkuConversionItemService,
    SkuConversionService,
    SkuTrailService,
    SkuService,
    SpuService,
    WarehouseSkuService,
    WarehouseService,
  ],
})
export class OrderManagementModule {}
