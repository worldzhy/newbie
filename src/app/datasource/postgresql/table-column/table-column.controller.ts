import {Controller, Get, Post, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {table} from 'console';
import {DatasourcePostgresqlService} from '../postgresql.service';
import {DatasourcePostgresqlTableColumnService} from './table-column.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('datasource')
export class DatasourcePostgresqlTableColumnController {
  private datasourcePostgresqlService = new DatasourcePostgresqlService();
  private datasourcePostgresqlTableColumnService =
    new DatasourcePostgresqlTableColumnService();

  /**
   * Get postgresql tables
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlTableColumnController
   */
  @Get('/postgresql/:datasourceId/tables')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourcePostgresqlTables(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourcePostgresqlService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid postgresql id.'},
      };
    }

    // [step 2] Get tables.
    const results = await this.datasourcePostgresqlTableColumnService.groupBy({
      by: ['table'],
      where: {
        datasourceId: datasource.id,
        table: {notIn: ['_prisma_migrations']},
      },
      orderBy: {table: 'asc'},
    });

    const tables = results.map(result => {
      return result.table;
    });

    if (tables.length > 0) {
      return {
        data: tables,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql table column failed.'},
      };
    }
  }

  /**
   * Get postgresql table columns
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlTableColumnController
   */
  @Get('/postgresql/:datasourceId/tables/columns')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlTableColumn.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourcePostgresqlTableColumns(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourcePostgresqlService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid postgresql id.'},
      };
    }

    // [step 2] Get columns group by table.
    const columnsGroupByTable: any[] = [];
    const results = await this.datasourcePostgresqlTableColumnService.groupBy({
      by: ['table'],
      where: {
        datasourceId: datasource.id,
        table: {notIn: ['_prisma_migrations']},
      },
      orderBy: {table: 'asc'},
    });

    await Promise.all(
      results.map(async result => {
        const columns =
          await this.datasourcePostgresqlTableColumnService.findMany({
            where: {
              AND: {
                datasourceId: datasource.id,
                table: result.table,
              },
            },
            orderBy: {ordinalPosition: 'asc'},
          });
        columnsGroupByTable.push({
          [result.table]: columns,
        });
      })
    );

    if (columnsGroupByTable.length > 0) {
      return {
        data: columnsGroupByTable,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql table column failed.'},
      };
    }
  }

  /**
   * Get postgresql table columns
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlTableColumnController
   */
  @Get('/postgresql/:datasourceId/tables/:tableName/columns')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlTableColumn.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiParam({
    name: 'tableName',
    schema: {type: 'string'},
    description: 'The name of the table.',
    example: 'User',
  })
  async getDatasourcePostgresqlColumnsByTable(
    @Param('datasourceId') datasourceId: string,
    @Param('tableName') tableName: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourcePostgresqlService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid postgresql id.'},
      };
    }

    // [step 2] Get columns group by table.
    const columns = await this.datasourcePostgresqlTableColumnService.findMany({
      where: {
        AND: {
          datasourceId: datasource.id,
          table: tableName,
        },
      },
      orderBy: {ordinalPosition: 'asc'},
    });

    if (columns.length > 0) {
      return {
        data: columns,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql table column failed.'},
      };
    }
  }

  /* End */
}
