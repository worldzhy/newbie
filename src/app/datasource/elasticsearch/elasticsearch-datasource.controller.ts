import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexFieldService} from './index-field/index-field.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceController {
  private elasticsearchDatasourceService = new ElasticsearchDatasourceService();
  private elasticsearchDatasourceIndexFieldService =
    new ElasticsearchDatasourceIndexFieldService();

  /**
   * Get datasource elasticsearchs by page number. The order is by elasticsearchDatasource name.
   *
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof ElasticsearchDatasourceController
   */
  @Get('/')
  async getElasticsearchDatasources(): Promise<{
    data: object | null;
    err: object | null;
  }> {
    const elasticsearchDatasources =
      await this.elasticsearchDatasourceService.findMany({});
    return {
      data: elasticsearchDatasources,
      err: null,
    };
  }

  /**
   * Get datasource elasticsearch by id
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceController
   */
  @Get('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the elasticsearchDatasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.elasticsearchDatasourceService.findOne({
      id: datasourceId,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get elasticsearchDatasource failed.'},
      };
    }
  }

  /**
   * Create a new datasource elasticsearch.
   *
   * @param {{
   *        node: string;
   *     }} body
   * @returns
   * @memberof ElasticsearchDatasourceController
   */
  @Post('/')
  @ApiBody({
    description:
      "The 'elasticsearchDatasourceName', 'clientName' and 'clientEmail' are required in request body.",
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
    body: {
      node: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create datasource elasticsearch.
    const result = await this.elasticsearchDatasourceService.create({
      ...body,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'ElasticsearchDatasource create failed.'},
      };
    }
  }

  /**
   * Update datasource elasticsearch
   * @param datasourceId
   * @param {{
   *        node: string;
   *     }} body
   * @returns
   */
  @Post('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update datasource elasticsearch.',
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
    @Body() body: {node: string}
  ) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.elasticsearchDatasourceService.update({
      where: {id: datasourceId},
      data: {...body},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datasource elasticsearch updated failed.'},
      };
    }
  }

  /**
   * Extract elasticsearch all index fields.
   *
   * @returns
   * @memberof ElasticsearchDatasourceIndexFieldController
   */
  @Post('/:datasourceId/extract')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async extractElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Get datasource.
    const datasource = await this.elasticsearchDatasourceService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 3] Extract elasticsearch all index fields.
    await this.elasticsearchDatasourceIndexFieldService.extract(datasource);
  }

  /**
   * Search elasticsearch.
   *
   * @returns
   * @memberof ElasticsearchDatasourceIndexFieldController
   */
  @Post('/:datasourceId/search')
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
    const datasource = await this.elasticsearchDatasourceService.findOne({
      id: datasourceId,
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

  /**
   * Search aggregations.
   *
   * @returns
   * @memberof ElasticsearchDatasourceIndexFieldController
   */
  @Post('/:datasourceId/search-aggregations')
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
    const datasource = await this.elasticsearchDatasourceService.findOne({
      id: datasourceId,
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
  /* End */
}
