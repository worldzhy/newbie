import {Controller, Get, Post, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatasourceElasticsearchService} from '../elasticsearch.service';
import {DatasourceElasticsearchIndexFieldService} from './index-field.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('datasource')
export class DatasourceElasticsearchIndexFieldController {
  private datasourceElasticsearchService = new DatasourceElasticsearchService();
  private datasourceElasticsearchIndexFieldService =
    new DatasourceElasticsearchIndexFieldService();
  /**
   * Get elasticsearch all index fields.
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourceElasticsearchIndexFieldController
   */
  @Get('/elasticsearch/:datasourceId/indices')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourceElasticsearchIndices(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourceElasticsearchService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 2] Get fields group by index.
    const results = await this.datasourceElasticsearchIndexFieldService.groupBy(
      {
        by: ['index'],
        where: {
          datasourceId: datasource.id,
        },
        orderBy: {index: 'asc'},
      }
    );

    const indices = results.map(result => {
      return result.index;
    });

    if (indices.length > 0) {
      return {
        data: indices.filter(index => {
          return !index.startsWith('.');
        }),
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get elasticsearch indices failed.'},
      };
    }
  }

  /**
   * Get elasticsearch all index fields.
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourceElasticsearchIndexFieldController
   */
  @Get('/elasticsearch/:datasourceId/indices/:indexName/fields')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiParam({
    name: 'indexName',
    schema: {type: 'string'},
    description: 'The name of the index.',
    example: 'profiles_1650438833178',
  })
  async getDatasourceElasticsearchIndexFields(
    @Param('datasourceId') datasourceId: string,
    @Param('indexName') indexName: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourceElasticsearchService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 2] Get fields group by index.
    const fields = await this.datasourceElasticsearchIndexFieldService.findMany(
      {
        where: {
          AND: {
            index: indexName,
            datasourceId: datasource.id,
          },
        },
      }
    );

    if (fields.length > 0) {
      return {
        data: fields,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get elasticsearch all index fields failed.'},
      };
    }
  }

  /* End */
}
