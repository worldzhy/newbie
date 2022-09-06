import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PostgresqlDatasourceTableColumnService} from './table-column/table-column.service';
import {PostgresqlDatasourceTableRelationService} from './table-relation/table-relation.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();
  private postgresqlDatasourceTableRelationService =
    new PostgresqlDatasourceTableRelationService();

  /**
   * Get postgresqlDatasources by page number. The order is by postgresqlDatasource name.
   *
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof PostgresqlDatasourceController
   */
  @Get('/')
  async getPostgresqlDatasources(): Promise<{
    data: object | null;
    err: object | null;
  }> {
    const postgresqlDatasources =
      await this.postgresqlDatasourceService.findMany({
        orderBy: {
          _relevance: {
            fields: ['database'],
            search: 'database',
            sort: 'asc',
          },
        },
      });
    return {
      data: postgresqlDatasources,
      err: null,
    };
  }

  /**
   * Get postgresqlDatasource by id
   *
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof PostgresqlDatasourceController
   */
  @Get('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlDatasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.postgresqlDatasourceService.findOne({
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
        err: {message: 'Get postgresqlDatasource failed.'},
      };
    }
  }

  /**
   * Create a new postgresqlDatasource.
   *
   * @param {{
   *        host: string;
   *        port: number;
   *        database: string;
   *        schema: string;
   *     }} body
   * @returns
   * @memberof PostgresqlDatasourceController
   */
  @Post('/')
  @ApiBody({
    description:
      "The 'postgresqlDatasourceName', 'clientName' and 'clientEmail' are required in request body.",
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
  async createPostgresqlDatasource(
    @Body()
    body: {
      host: string;
      port: number;
      database: string;
      schema: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create postgresqlDatasource.
    const result = await this.postgresqlDatasourceService.create({
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
        err: {message: 'PostgresqlDatasource create failed.'},
      };
    }
  }

  /**
   * Update postgresqlDatasource
   *
   * @param {string} datasourceId
   * @param {{
   *        host: string;
   *        port: number;
   *        database: string;
   *      }} body
   * @returns
   * @memberof PostgresqlDatasourceController
   */
  @Post('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update postgresqlDatasource.',
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
  async updatePostgresqlDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {host: string; port: number; database: string}
  ) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.postgresqlDatasourceService.update({
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
        err: {message: 'PostgresqlDatasource updated failed.'},
      };
    }
  }

  /**
   * Generate a new postgresql table columns.
   *
   * @returns
   * @memberof PostgresqlDatasourceTableColumnController
   */
  @Post('/:datasourceId/extract')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlTableColumn.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async extractPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Get postgresql.
    const postgresql = await this.postgresqlDatasourceService.findOne({
      id: datasourceId,
    });
    if (!postgresql) {
      return;
    }

    // [step 3] Extract datasource postgresql table columns.
    const tableColumns =
      await this.postgresqlDatasourceTableColumnService.extract(postgresql);
    if (!tableColumns) {
      return {
        data: null,
        err: {message: 'PostgresqlDatasourceTableColumn create failed.'},
      };
    }

    // [step 4] Extract datasource postgresql table relations.
    const tableRelations =
      await this.postgresqlDatasourceTableRelationService.extract(postgresql);
    if (!tableRelations) {
      return {
        data: null,
        err: {message: 'PostgresqlDatasourceTableRelation create failed.'},
      };
    }

    return {
      tableColumns,
      tableRelations,
    };
  }

  /* End */
}
