import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Body,
  Param,
  BadRequestException,
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
  constructor(
    private elasticsearchDatasourceIndexService: ElasticsearchDatasourceIndexService
  ) {}

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
    // [step 1] Create an index in elasticsearch.
    await this.elasticsearchDatasourceIndexService.createIndex(body.name);

    // [step 2] Save the index record in database.
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
    schema: {type: 'number'},
    description: 'The id of the index.',
    example: 1,
  })
  async getElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.elasticsearchDatasourceIndexService.findUnique({
      where: {id: indexId},
    });
  }

  @Patch(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number,
    @Body() body: Prisma.ElasticsearchDatasourceIndexUpdateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.update({
      where: {id: indexId},
      data: body,
    });
  }

  @Delete(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndex> {
    // [step 1] Get the index.
    const index =
      await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
        where: {id: indexId},
      });

    // [step 2] Delete an index in elasticsearch.
    await this.elasticsearchDatasourceIndexService.createIndex(index.name);

    // [step 3] Save the index record in database.
    return await this.elasticsearchDatasourceIndexService.delete({
      where: {id: indexId},
    });
  }

  @Put(':indexId/mapping')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The id of the index.',
    example: 1,
  })
  async putElasticsearchDatasourceIndexMapping(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndex> {
    // [step 1] Get index.
    const index =
      await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
        where: {id: indexId},
        include: {fields: true},
      });

    // [step 2] Construct and put mapping.
    const mapping = {properties: {}};
    const fields: ElasticsearchDatasourceIndexField[] = index['fields'];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      mapping.properties[field.name] = {
        type: field.type,
        fields: field.fields,
        properties: field.properties,
      };
    }
    await this.elasticsearchDatasourceIndexService.putMapping(
      index.name,
      mapping
    );

    // [step 3] Update index state.
    return this.elasticsearchDatasourceIndexService.update({
      where: {id: indexId},
      data: {state: ElasticsearchDatasourceIndexState.HAS_MAPPING},
    });
  }

  @Get(':indexId/mapping')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The id of the index.',
    example: 1,
  })
  async getElasticsearchDatasourceIndexMapping(
    @Param('indexId') indexId: number
  ) {
    const index =
      await this.elasticsearchDatasourceIndexService.findUniqueOrThrow({
        where: {id: indexId},
      });
    if (index.state === ElasticsearchDatasourceIndexState.NO_MAPPING) {
      throw new BadRequestException(
        "Bad Request to get a NO_MAPPING index's mapping"
      );
    }

    return await this.elasticsearchDatasourceIndexService.getMapping(
      index.name
    );
  }

  /* End */
}
