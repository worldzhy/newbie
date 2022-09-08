import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDatasourceService} from '../elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexService} from './index.service';

@ApiTags('App / Datasource / Elasticsearch / Index')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceIndexController {
  private elasticsearchDatasourceService = new ElasticsearchDatasourceService();
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();

  /**
   * Get elasticsearch indices.
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceIndexController
   */
  @Get('/:datasourceId/indices')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndices(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
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

    // [step 2] Get indices.
    const indices = await this.elasticsearchDatasourceIndexService.findMany({
      where: {datasourceId: datasource.id},
      orderBy: {name: 'asc'},
    });

    return {
      data: indices,
      err: null,
    };
  }

  /**
   * Get an elasticsearch index by id.
   * @param {string} indexId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceIndexController
   */
  @Get('/indices/:indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number
  ): Promise<{data: object | null; err: object | null}> {
    const index = await this.elasticsearchDatasourceIndexService.findOne({
      id: indexId,
    });

    if (index) {
      return {
        data: index,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }
  }

  /**
   * Create an elasticsearch index.
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceIndexController
   */
  @Post('/:datasourceId/indices')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create index',
        value: {
          name: 'example_index_name',
        },
      },
    },
  })
  async createElasticsearchDatasourceIndex(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {name: string}
  ): Promise<{data: object | null; err: object | null}> {
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

    // [step 2] Create index.
    const index = await this.elasticsearchDatasourceIndexService.create({
      name: body.name,
      datasource: {connect: {id: datasourceId}},
    });

    if (index) {
      return {
        data: index,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Create elasticsearch index failed.'},
      };
    }
  }

  /* End */
}
