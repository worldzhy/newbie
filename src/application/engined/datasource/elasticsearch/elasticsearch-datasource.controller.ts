import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDatasource,
  ElasticsearchDatasourceIndex,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexService} from './index/index.service';

@ApiTags('[Application] EngineD / Datasource / Elasticsearch')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceController {
  private elasticsearchDatasourceService = new ElasticsearchDatasourceService();
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();

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

  /**
   * Get datasource elasticsearch by id
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceController
   */
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
  ) {
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

  @Get(':datasourceId/indices')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndicesByDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasourceIndex[] | {err: {message: string}}> {
    // [step 1] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {err: {message: 'Invalid datasource id.'}};
    }

    // [step 2] Get indices.
    return await this.elasticsearchDatasourceIndexService.findMany({
      where: {datasourceId: datasource.id},
      orderBy: {name: 'asc'},
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
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
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
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 2] Search datasource.
    return await this.elasticsearchDatasourceService.searchAggregations(body);
  }

  /**
   * Mount an elasticsearch datasource.
   *
   * @returns
   * @memberof ElasticsearchDatasourceController
   */
  @Post(':datasourceId/mount')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async mountElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 3] Extract elasticsearch all index fields.
    await this.elasticsearchDatasourceService.mount(datasource);

    return {
      data: 'Done',
      err: null,
    };
  }

  /**
   * Unmount an elasticsearch datasource.
   *
   * @returns
   * @memberof ElasticsearchDatasourceController
   */
  @Post(':datasourceId/unmount')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the elasticsearch datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async unmountPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasourceId.'},
      };
    }

    // [step 2] Clear elasticsearch datasource indices and fields.
    await this.elasticsearchDatasourceService.unmount(datasource);
  }
  /* End */
}
