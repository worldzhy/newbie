import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDatasource, Prisma} from '@prisma/client';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';

@ApiTags('[Application] EngineD / Datasource / Elasticsearch')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceController {
  private elasticsearchDatasourceService = new ElasticsearchDatasourceService();

  @Post('')
  @ApiBody({
    description: "The 'node' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          node: '24.323.232.23',
        },
      },
    },
  })
  async createElasticsearchDatasource(
    @Body()
    body: Prisma.ElasticsearchDatasourceCreateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.create({data: body});
  }

  @Get('')
  async getElasticsearchDatasources(): Promise<ElasticsearchDatasource[]> {
    return await this.elasticsearchDatasourceService.findMany({});
  }

  @Get(':datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the elasticsearch datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource | null> {
    return await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
  }

  @Patch(':datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update elasticsearch datasource.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          node: '12.323.232.23',
        },
      },
    },
  })
  async updateElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body() body: Prisma.ElasticsearchDatasourceUpdateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.update({
      where: {id: datasourceId},
      data: body,
    });
  }

  @Delete(':datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.delete({
      where: {id: datasourceId},
    });
  }

  /**
   * Load an elasticsearch datasource.
   */
  @Patch(':datasourceId/load')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async loadElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    // [step 1] Guard statement.

    // [step 2] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 3] Extract elasticsearch all index fields.
    return await this.elasticsearchDatasourceService.load(datasource);
  }

  /**
   * Unload an elasticsearch datasource.
   */
  @Patch(':datasourceId/unload')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the elasticsearch datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async unloadPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    // [step 1] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Clear elasticsearch datasource indices and fields.
    return await this.elasticsearchDatasourceService.unload(datasource);
  }

  @Get(':datasourceId/indices')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndices(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.findUniqueOrThrow({
      where: {id: datasourceId},
      include: {indices: true},
    });
  }

  @Post(':datasourceId/search')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: 'Search elasticsearch datasource.',
    examples: {
      a: {
        summary: '1. Search',
        value: {
          index: 'users',
          body: {},
          from: 0,
          size: 10,
          sort: [],
        },
      },
    },
  })
  async searchElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body()
    body: {
      index: string;
      body: JSON;
      from: number;
      size: number;
      sort: string[];
    }
  ) {
    // [step 1] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Search datasource.
    return await this.elasticsearchDatasourceService.search(body);
  }

  @Post(':datasourceId/search-aggregations')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: 'Search aggregations.',
    examples: {
      a: {
        summary: '1. Search aggregations',
        value: {
          aggregationMode: null,
          option: {},
          searchDto: {},
          type: 'terms',
        },
      },
    },
  })
  async searchAggregationsElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body()
    body: {
      aggregationMode: string;
      option: JSON;
      searchDto: JSON;
      type: string;
    }
  ) {
    // [step 1] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Search datasource.
    return await this.elasticsearchDatasourceService.searchAggregations(body);
  }

  /* End */
}
