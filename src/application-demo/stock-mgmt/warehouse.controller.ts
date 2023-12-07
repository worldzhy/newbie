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
import {PermissionAction, Prisma, Warehouse} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {WarehouseService} from '@microservices/stock-mgmt/warehouse.service';

@ApiTags('Warehouse')
@ApiBearerAuth()
@Controller('warehouseWarehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Warehouse)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createWarehouse(
    @Body() body: Prisma.WarehouseUncheckedCreateInput
  ): Promise<Warehouse> {
    return await this.warehouseService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Warehouse)
  async getWarehouses(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.warehouseService.findManyInManyPages({page, pageSize});
  }

  @Get(':warehouseWarehouseId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Warehouse)
  async getWarehouse(
    @Param('warehouseId') warehouseId: string
  ): Promise<Warehouse> {
    return await this.warehouseService.findUniqueOrThrow({
      where: {id: warehouseId},
    });
  }

  @Patch(':warehouseId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Warehouse)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateWarehouse(
    @Param('warehouseWarehouseId') warehouseId: string,
    @Body() body: Prisma.WarehouseUpdateInput
  ): Promise<Warehouse> {
    return await this.warehouseService.update({
      where: {id: warehouseId},
      data: body,
    });
  }

  @Delete(':warehouseWarehouseId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Warehouse)
  async deleteWarehouse(
    @Param('warehouseId') warehouseId: string
  ): Promise<Warehouse> {
    return await this.warehouseService.delete({
      where: {id: warehouseId},
    });
  }

  /* End */
}
