import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatasourceElasticsearchService} from './elasticsearch.service';
import {DatasourceElasticsearchIndexFieldService} from './index-field/index-field.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('datasource')
export class DatasourceElasticsearchController {
  private datasourceElasticsearchService = new DatasourceElasticsearchService();
  private datasourceElasticsearchIndexFieldService =
    new DatasourceElasticsearchIndexFieldService();

  /**
   * Get datasourceElasticsearchs by page number. The order is by datasourceElasticsearch name.
   *
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DatasourceElasticsearchController
   */
  @Get('/elasticsearch')
  async getDatasourceElasticsearchs(): Promise<{
    data: object | null;
    err: object | null;
  }> {
    const datasourceElasticsearchs =
      await this.datasourceElasticsearchService.findMany({});
    return {
      data: datasourceElasticsearchs,
      err: null,
    };
  }

  /**
   * Get datasourceElasticsearch by id
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourceElasticsearchController
   */
  @Get('/elasticsearch/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasourceElasticsearch.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourceElasticsearch(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datasourceElasticsearchService.findOne({
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
        err: {message: 'Get datasourceElasticsearch failed.'},
      };
    }
  }

  /**
   * Create a new datasourceElasticsearch.
   *
   * @param {{
   *        node: string;
   *     }} body
   * @returns
   * @memberof DatasourceElasticsearchController
   */
  @Post('/elasticsearch')
  @ApiBody({
    description:
      "The 'datasourceElasticsearchName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          node: '24.323.232.23',
        },
      },
    },
  })
  async createDatasourceElasticsearch(
    @Body()
    body: {
      node: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create datasourceElasticsearch.
    const result = await this.datasourceElasticsearchService.create({
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
        err: {message: 'DatasourceElasticsearch create failed.'},
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
  @Post('/elasticsearch/:datasourceId')
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
  async updateDatasourceElasticsearch(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {node: string}
  ) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.datasourceElasticsearchService.update({
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
   * @memberof DatasourceElasticsearchIndexFieldController
   */
  @Post('/elasticsearch/:datasourceId/extract')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async extractDatasourceElasticsearchIndexFields(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Get datasource.
    const datasource = await this.datasourceElasticsearchService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 3] Extract elasticsearch all index fields.
    await this.datasourceElasticsearchIndexFieldService.extract(datasource);
  }

  /* End */
}
