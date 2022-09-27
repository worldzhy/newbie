import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDatasourceIndex,
  ElasticsearchDatasourceIndexField,
  ElasticsearchDatasourceIndexState,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDatasourceIndexService} from './index.service';

@ApiTags('[Application] EngineD / Elasticsearch Datasource Index')
@ApiBearerAuth()
@Controller('elasticsearch-datasource-indices')
export class ElasticsearchDatasourceIndexController {
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create index',
        value: {
          datasourceId: 'd8141ece-f242-4288-a60a-8675538549cd',
          name: 'example_index_name',
        },
      },
    },
  })
  async createElasticsearchDatasourceIndex(
    @Body() body: Prisma.ElasticsearchDatasourceIndexUncheckedCreateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.create({
      data: body,
    });
  }

  @Get('')
  async getElasticsearchDatasourceIndices(): Promise<
    ElasticsearchDatasourceIndex[]
  > {
    return await this.elasticsearchDatasourceIndexService.findMany({});
  }

  @Get(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 1,
  })
  async getElasticsearchDatasourceIndex(
    @Param('indexId') indexId: string
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.elasticsearchDatasourceIndexService.findUnique({
      where: {id: parseInt(indexId)},
    });
  }

  @Patch(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndex(
    @Param('indexId') indexId: string,
    @Body() body: Prisma.ElasticsearchDatasourceIndexUpdateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.update({
      where: {id: parseInt(indexId)},
      data: body,
    });
  }

  @Delete(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    example: 1,
  })
  async deleteElasticsearchDatasourceIndex(
    @Param('indexId') indexId: string
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.delete({
      where: {id: parseInt(indexId)},
    });
  }

  @Put(':indexId/mapping')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    description: 'The uuid of the index.',
    example: 1,
  })
  async putElasticsearchDatasourceIndexMapping(
    @Param('indexId') indexId: string
  ): Promise<ElasticsearchDatasourceIndex> {
    // [step 1] Get index.
    const index =
      await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
        where: {id: parseInt(indexId)},
        include: {fields: true},
      });

    // [step 2] Construct and put mapping.
    const mapping = {};
    const fields: ElasticsearchDatasourceIndexField[] = index['fields'];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      mapping[field.name] = field;
    }
    await this.elasticsearchDatasourceIndexService.putMapping(
      index.name,
      mapping
    );

    // [step 3] Update index state.
    return this.elasticsearchDatasourceIndexService.update({
      where: {id: parseInt(indexId)},
      data: {state: ElasticsearchDatasourceIndexState.HAS_MAPPING},
    });
  }

  @Get(':indexId/mapping')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    description: 'The uuid of the index.',
    example: 1,
  })
  async getElasticsearchDatasourceIndexMapping(
    @Param('indexId') indexId: string
  ) {
    // return await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
    //   where: {id: parseInt(indexId)},
    //   include: {fields: true},
    // });

    const index =
      await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
        where: {id: parseInt(indexId)},
      });

    return await this.elasticsearchDatasourceIndexService.getMapping(
      index.name
    );
  }

  /* End */
}
