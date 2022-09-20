import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDataboard,
  ElasticsearchDataboardState,
  ElasticsearchDatasourceIndexField,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDataboardService} from './elasticsearch-databoard.service';
import {ElasticsearchDataboardColumnService} from './column/column.service';

@ApiTags('[Application] EngineD / Elasticsearch Databoard')
@ApiBearerAuth()
@Controller('elasticsearch-databoards')
export class ElasticsearchDataboardController {
  private elasticsearchDataboardService = new ElasticsearchDataboardService();
  private elasticsearchDataboardColumnService =
    new ElasticsearchDataboardColumnService();

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
    return await this.elasticsearchDataboardService.create({data: body});
  }

  @Get('')
  async getElasticsearchDataboards(): Promise<ElasticsearchDataboard[]> {
    return await this.elasticsearchDataboardService.findMany({});
  }

  @Get(':databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    description: 'The uuid of the databoard.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard | null> {
    return await this.elasticsearchDataboardService.findUnique({
      where: {id: databoardId},
    });
  }

  @Patch(':databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
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
    return await this.elasticsearchDataboardService.update({
      where: {id: databoardId},
      data: body,
    });
  }

  @Delete(':databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    return await this.elasticsearchDataboardService.delete({
      where: {id: databoardId},
    });
  }

  @Patch(':databoardId/load')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async loadElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    const databoard = await this.elasticsearchDataboardService.findUnique({
      where: {id: databoardId},
      include: {datasourceIndex: {include: {fields: true}}},
    });

    if (!databoard) {
      throw new NotFoundException('Not found the databoard.');
    }

    // [step 2] Load columns
    const datasourceIndexFields: ElasticsearchDatasourceIndexField[] =
      databoard['datasourceIndex']['fields'];

    await this.elasticsearchDataboardColumnService.createMany({
      data: datasourceIndexFields.map(field => {
        return {
          name: field.name,
          databoardId: databoardId,
          datasourceIndexFieldId: field.id,
        };
      }),
    });

    // [step 3] Update databoard state
    return await this.elasticsearchDataboardService.update({
      where: {id: databoardId},
      data: {state: ElasticsearchDataboardState.READY},
    });
  }

  @Patch(':databoardId/unload')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async unloadElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    const databoard = await this.elasticsearchDataboardService.findUnique({
      where: {id: databoardId},
    });

    if (!databoard) {
      throw new NotFoundException('Not found the databoard.');
    }

    // [step 2] Unload columns
    await this.elasticsearchDataboardColumnService.deleteMany({
      where: {databoardId: databoardId},
    });

    // [step 3] Update databoard state
    return await this.elasticsearchDataboardService.update({
      where: {id: databoardId},
      data: {state: ElasticsearchDataboardState.PREPARING},
    });
  }

  @Get(':databoardId/columns')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async getElasticsearchDataboardColumns(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    // [step 1] Get databoard
    return await this.elasticsearchDataboardService.findUniqueOrThrow({
      where: {id: databoardId},
      include: {columns: true},
    });
  }

  /* End */
}
