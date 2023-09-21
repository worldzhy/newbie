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
import {PermissionAction, Prisma, SkuTrail} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {SkuTrailService} from '@microservices/stock-mgmt/sku-trail.service';

@ApiTags('SkuTrail')
@ApiBearerAuth()
@Controller('skuTrails')
export class SkuTrailController {
  constructor(private readonly skuTrailService: SkuTrailService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.SkuTrail)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createSkuTrail(
    @Body() body: Prisma.SkuTrailUncheckedCreateInput
  ): Promise<SkuTrail> {
    return await this.skuTrailService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.SkuTrail)
  async getSkuTrails(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return await this.skuTrailService.findManyWithPagination(
      {},
      {page, pageSize}
    );
  }

  @Get(':skuTrailId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.SkuTrail)
  async getSkuTrail(
    @Param('skuTrailId') skuTrailId: number
  ): Promise<SkuTrail> {
    return await this.skuTrailService.findUniqueOrThrow({
      where: {id: skuTrailId},
    });
  }

  @Patch(':skuTrailId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.SkuTrail)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateSkuTrail(
    @Param('skuTrailId') skuTrailId: number,
    @Body() body: Prisma.SkuTrailUpdateInput
  ): Promise<SkuTrail> {
    return await this.skuTrailService.update({
      where: {id: skuTrailId},
      data: body,
    });
  }

  @Delete(':skuTrailId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.SkuTrail)
  async deleteSkuTrail(
    @Param('skuTrailId') skuTrailId: number
  ): Promise<SkuTrail> {
    return await this.skuTrailService.delete({
      where: {id: skuTrailId},
    });
  }

  /* End */
}
