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
import {PermissionAction, Prisma, Spu} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Spu')
@ApiBearerAuth()
@Controller('spus')
export class SpuController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Spu)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {},
      },
    },
  })
  async createSpu(@Body() body: Prisma.SpuUncheckedCreateInput): Promise<Spu> {
    return await this.prisma.spu.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Spu)
  async getSpus(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Spu,
      pagination: {page, pageSize},
    });
  }

  @Get(':spuId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Spu)
  async getSpu(@Param('spuId') spuId: string): Promise<Spu> {
    return await this.prisma.spu.findUniqueOrThrow({where: {id: spuId}});
  }

  @Patch(':spuId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Spu)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {},
      },
    },
  })
  async updateSpu(
    @Param('spuId') spuId: string,
    @Body() body: Prisma.SpuUpdateInput
  ): Promise<Spu> {
    return await this.prisma.spu.update({
      where: {id: spuId},
      data: body,
    });
  }

  @Delete(':spuId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Spu)
  async deleteSpu(@Param('spuId') spuId: string): Promise<Spu> {
    return await this.prisma.spu.delete({
      where: {id: spuId},
    });
  }

  /* End */
}
