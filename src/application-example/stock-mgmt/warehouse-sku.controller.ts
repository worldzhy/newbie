import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {PermissionAction, Prisma, WarehouseSku} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {WarehouseSkuService} from '@microservices/stock-mgmt/warehouse-sku.service';

@ApiTags('WarehouseSku')
@ApiBearerAuth()
@Controller('warehouseWarehouseSkus')
export class WarehouseSkuController {
  constructor(private readonly warehouseSkuService: WarehouseSkuService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.WarehouseSku)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createWarehouseSku(
    @Body() body: Prisma.WarehouseSkuUncheckedCreateInput
  ): Promise<WarehouseSku> {
    return await this.warehouseSkuService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.WarehouseSku)
  async getWarehouseSkus(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.warehouseSkuService.findManyWithPagination(
      {},
      {page, pageSize}
    );
  }

  @Get(':warehouseWarehouseSkuId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.WarehouseSku)
  async getWarehouseSku(
    @Param('warehouseSkuId') warehouseSkuId: number
  ): Promise<WarehouseSku> {
    return await this.warehouseSkuService.findUniqueOrThrow({
      where: {id: warehouseSkuId},
    });
  }

  @Patch(':warehouseSkuId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.WarehouseSku)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateWarehouseSku(
    @Param('warehouseWarehouseSkuId') warehouseSkuId: number,
    @Body() body: Prisma.WarehouseSkuUpdateInput
  ): Promise<WarehouseSku> {
    return await this.warehouseSkuService.update({
      where: {id: warehouseSkuId},
      data: body,
    });
  }

  @Delete(':warehouseWarehouseSkuId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.WarehouseSku)
  async deleteWarehouseSku(
    @Param('warehouseSkuId') warehouseSkuId: number
  ): Promise<WarehouseSku> {
    return await this.warehouseSkuService.delete({
      where: {id: warehouseSkuId},
    });
  }

  /* End */
}
