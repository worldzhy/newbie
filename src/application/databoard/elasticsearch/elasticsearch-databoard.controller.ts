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
import {
  ElasticsearchDataboard,
  ElasticsearchDataboardState,
  ElasticsearchDatasourceIndexField,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Databoard - Elasticsearch')
@ApiBearerAuth()
@Controller('elasticsearch-databoards')
export class ElasticsearchDataboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @ApiBody({
    description:
      "The 'name' and 'datasourceType' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'databoard_01',
          datasourceIndexId: 1,
        },
      },
    },
  })
  async createElasticsearchDataboard(
    @Body()
    body: Prisma.ElasticsearchDataboardUncheckedCreateInput
  ) {
    return await this.prisma.elasticsearchDataboard.create({data: body});
  }

  @Get('')
  async getElasticsearchDataboards(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {}

  @Get(':databoardId')
  async getElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.findUniqueOrThrow({
      where: {id: databoardId},
    });
  }

  @Patch(':databoardId')
  @ApiBody({
    description: 'Update databoard.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'databoard-01',
        },
      },
    },
  })
  async updateElasticsearchDataboard(
    @Param('databoardId') databoardId: string,
    @Body() body: Prisma.ElasticsearchDataboardUpdateInput
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.update({
      where: {id: databoardId},
      data: body,
    });
  }

  @Delete(':databoardId')
  async deleteElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.delete({
      where: {id: databoardId},
    });
  }

  @Patch(':databoardId/load')
  async loadElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    const databoard =
      await this.prisma.elasticsearchDataboard.findUniqueOrThrow({
        where: {id: databoardId},
        include: {datasourceIndex: {include: {fields: true}}},
      });

    // [step 2] Load columns
    const datasourceIndexFields: ElasticsearchDatasourceIndexField[] =
      databoard['datasourceIndex']['fields'];

    await this.prisma.elasticsearchDataboardColumn.createMany({
      data: datasourceIndexFields.map(field => {
        return {
          name: field.name,
          databoardId: databoardId,
          datasourceIndexFieldId: field.id,
        };
      }),
    });

    // [step 3] Update databoard state
    return await this.prisma.elasticsearchDataboard.update({
      where: {id: databoardId},
      data: {state: ElasticsearchDataboardState.LOADED},
    });
  }

  @Patch(':databoardId/unload')
  async unloadElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    const databoard =
      await this.prisma.elasticsearchDataboard.findUniqueOrThrow({
        where: {id: databoardId},
      });

    // [step 2] Unload columns
    await this.prisma.elasticsearchDataboardColumn.deleteMany({
      where: {databoardId: databoardId},
    });

    // [step 3] Update databoard state
    return await this.prisma.elasticsearchDataboard.update({
      where: {id: databoardId},
      data: {state: ElasticsearchDataboardState.NOT_LOADED},
    });
  }

  @Get(':databoardId/columns')
  async getElasticsearchDataboardColumns(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    return await this.prisma.elasticsearchDataboard.findUniqueOrThrow({
      where: {id: databoardId},
      include: {columns: true},
    });
  }

  /* End */
}
