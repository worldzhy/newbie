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
import {PermissionAction, Prisma, Sku} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Sku')
@ApiBearerAuth()
@Controller('skus')
export class SkuController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Sku)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createSku(@Body() body: Prisma.SkuUncheckedCreateInput): Promise<Sku> {
    return await this.prisma.sku.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Sku)
  async getSkus(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Sku,
      pagination: {page, pageSize},
    });
  }

  @Get(':skuId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Sku)
  async getSku(@Param('skuId') skuId: string): Promise<Sku> {
    return await this.prisma.sku.findUniqueOrThrow({where: {id: skuId}});
  }

  @Patch(':skuId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Sku)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateSku(
    @Param('skuId') skuId: string,
    @Body() body: Prisma.SkuUpdateInput
  ): Promise<Sku> {
    return await this.prisma.sku.update({
      where: {id: skuId},
      data: body,
    });
  }

  @Delete(':skuId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Sku)
  async deleteSku(@Param('skuId') skuId: string): Promise<Sku> {
    return await this.prisma.sku.delete({
      where: {id: skuId},
    });
  }

  /* End */
}
