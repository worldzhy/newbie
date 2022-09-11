import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {ElasticsearchDatasourceIndexService} from '../index/index.service';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';

@ApiTags('[Product] EngineD / Datasource / Elasticsearch / Index')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceIndexFieldController {
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();
  private elasticsearchDatasourceIndexFieldService =
    new ElasticsearchDatasourceIndexFieldService();

  /**
   * Get index fields.
   * @param {string} indexId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ElasticsearchDatasourceIndexFieldController
   */
  @Get('/indices/:indexId/fields')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The uuid of the index.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndexFields(
    @Param('indexId') indexId: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get index.
    const index = await this.elasticsearchDatasourceIndexService.findOne({
      id: indexId,
    });
    if (!index) {
      return {
        data: null,
        err: {message: 'Invalid index id.'},
      };
    }

    // [step 2] Get fields group by index.
    const fields = await this.elasticsearchDatasourceIndexFieldService.findMany(
      {where: {indexId: indexId}}
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
