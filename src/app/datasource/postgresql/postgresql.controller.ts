import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatasourcePostgresqlService} from './postgresql.service';
import {DatasourcePostgresqlTableColumnService} from './table-column/table-column.service';
import {DatasourcePostgresqlTableRelationService} from './table-relation/table-relation.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('datasource')
export class DatasourcePostgresqlController {
  private datasourcePostgresqlService = new DatasourcePostgresqlService();
  private datasourcePostgresqlTableColumnService =
    new DatasourcePostgresqlTableColumnService();
  private datasourcePostgresqlTableRelationService =
    new DatasourcePostgresqlTableRelationService();

  /**
   * Get datasourcePostgresqls by page number. The order is by datasourcePostgresql name.
   *
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DatasourcePostgresqlController
   */
  @Get('/postgresql')
  async getDatasourcePostgresqls(): Promise<{
    data: object | null;
    err: object | null;
  }> {
    const datasourcePostgresqls =
      await this.datasourcePostgresqlService.findMany({
        orderBy: {
          _relevance: {
            fields: ['database'],
            search: 'database',
            sort: 'asc',
          },
        },
      });
    return {
      data: datasourcePostgresqls,
      err: null,
    };
  }

  /**
   * Get datasourcePostgresql by id
   *
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlController
   */
  @Get('/postgresql/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasourcePostgresql.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourcePostgresql(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datasourcePostgresqlService.findOne({
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
        err: {message: 'Get datasourcePostgresql failed.'},
      };
    }
  }

  /**
   * Create a new datasourcePostgresql.
   *
   * @param {{
   *        host: string;
   *        port: number;
   *        database: string;
   *        schema: string;
   *     }} body
   * @returns
   * @memberof DatasourcePostgresqlController
   */
  @Post('/postgresql')
  @ApiBody({
    description:
      "The 'datasourcePostgresqlName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          host: '24.323.232.23',
          port: 5432,
          database: 'postgres',
          schema: '_basic',
        },
      },
    },
  })
  async createDatasourcePostgresql(
    @Body()
    body: {
      host: string;
      port: number;
      database: string;
      schema: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create datasourcePostgresql.
    const result = await this.datasourcePostgresqlService.create({
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
        err: {message: 'DatasourcePostgresql create failed.'},
      };
    }
  }

  /**
   * Update datasourcePostgresql
   *
   * @param {string} datasourceId
   * @param {{
   *        host: string;
   *        port: number;
   *        database: string;
   *      }} body
   * @returns
   * @memberof DatasourcePostgresqlController
   */
  @Post('/postgresql/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update datasourcePostgresql.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          host: '12.323.232.23',
          port: 5432,
          database: 'postgres',
        },
      },
    },
  })
  async updateDatasourcePostgresql(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {host: string; port: number; database: string}
  ) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.datasourcePostgresqlService.update({
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
        err: {message: 'DatasourcePostgresql updated failed.'},
      };
    }
  }

  /**
   * Generate a new postgresql table columns.
   *
   * @returns
   * @memberof DatasourcePostgresqlTableColumnController
   */
  @Post('/postgresql/:datasourceId/extract')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlTableColumn.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async extractDatasourcePostgresql(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Get postgresql.
    const postgresql = await this.datasourcePostgresqlService.findOne({
      id: datasourceId,
    });
    if (!postgresql) {
      return;
    }

    // [step 3] Extract datasource postgresql table columns.
    const tableColumns =
      await this.datasourcePostgresqlTableColumnService.extract(postgresql);
    if (!tableColumns) {
      return {
        data: null,
        err: {message: 'DatasourcePostgresqlTableColumn create failed.'},
      };
    }

    // [step 4] Extract datasource postgresql table relations.
    const tableRelations =
      await this.datasourcePostgresqlTableRelationService.extract(postgresql);
    if (!tableRelations) {
      return {
        data: null,
        err: {message: 'DatasourcePostgresqlTableRelation create failed.'},
      };
    }

    return {
      tableColumns,
      tableRelations,
    };
  }

  /* End */
}
