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
import {PermissionAction, Prisma, SkuConversion} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {SkuConversionService} from '@microservices/stock-mgmt/sku-conversion.service';

@ApiTags('SkuConversion')
@ApiBearerAuth()
@Controller('skuConversions')
export class SkuConversionController {
  constructor(private readonly skuConversionService: SkuConversionService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.SkuConversion)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createSkuConversion(
    @Body() body: Prisma.SkuConversionUncheckedCreateInput
  ): Promise<SkuConversion> {
    return await this.skuConversionService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.SkuConversion)
  async getSkuConversions(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.skuConversionService.findManyInManyPages({
      page,
      pageSize,
    });
  }

  @Get(':skuConversionId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.SkuConversion)
  async getSkuConversion(
    @Param('skuConversionId') skuConversionId: number
  ): Promise<SkuConversion> {
    return await this.skuConversionService.findUniqueOrThrow({
      where: {id: skuConversionId},
    });
  }

  @Patch(':skuConversionId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.SkuConversion)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateSkuConversion(
    @Param('skuConversionId') skuConversionId: number,
    @Body() body: Prisma.SkuConversionUpdateInput
  ): Promise<SkuConversion> {
    return await this.skuConversionService.update({
      where: {id: skuConversionId},
      data: body,
    });
  }

  @Delete(':skuConversionId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.SkuConversion)
  async deleteSkuConversion(
    @Param('skuConversionId') skuConversionId: number
  ): Promise<SkuConversion> {
    return await this.skuConversionService.delete({
      where: {id: skuConversionId},
    });
  }

  /* End */
}
