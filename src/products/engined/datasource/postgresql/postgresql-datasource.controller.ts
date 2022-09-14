import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './table/table.service';

@ApiTags('[Product] EngineD / Datasource / Postgresql')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();

  /**
   * Get postgresqlDatasources by page number. The order is by postgresql datasource name.
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
   * Get postgresql datasource by id
   *
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof PostgresqlDatasourceController
   */
  @Get('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresql datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql datasource failed.'},
      };
    }
  }

  /**
   * Create a new postgresql datasource.
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
      "The 'host', 'port', 'database' and 'schema' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          host: '24.323.232.23',
          port: 5432,
          database: 'postgres',
          schema: 'public',
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

    // [step 2] Create postgresql datasource.
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
        err: {message: 'Postgresql datasource created failed.'},
      };
    }
  }

  /**
   * Update postgresql datasource
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
    description: 'Update postgresql datasource.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          host: '12.323.232.23',
          port: 5432,
          database: 'postgres',
          schema: 'public',
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
   * Mount a postgresql datasource.
   *
   * @returns
   * @memberof PostgresqlDatasourceTableColumnController
   */
  @Post('/:datasourceId/mount')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresql datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async mountPostgresqlDatasource(@Param('datasourceId') datasourceId: string) {
    // [step 1] Get postgresql.
    const postgresql = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!postgresql) {
      return {
        data: null,
        err: {message: 'Invalid datasourceId.'},
      };
    }

    // [step 2] Check if the datasource has been mounted.
    const count = await this.postgresqlDatasourceTableService.count({
      where: {datasourceId: datasourceId},
    });
    if (count > 0) {
      return {
        data: null,
        err: {
          message:
            'The datasource can not be mounted again before it has been unmounted.',
        },
      };
    }

    // [step 3] Extract datasource postgresql tables, columns, constraints.
    await this.postgresqlDatasourceService.mount(postgresql);

    return {
      data: 'Done',
      err: null,
    };
  }

  /**
   * Unmount a postgresql datasource.
   *
   * @returns
   * @memberof PostgresqlDatasourceTableColumnController
   */
  @Post('/:datasourceId/unmount')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresql datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async unmountPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ) {
    // [step 1] Get postgresql.
    const postgresql = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!postgresql) {
      return {
        data: null,
        err: {message: 'Invalid datasourceId.'},
      };
    }

    // [step 2] Clear datasource postgresql tables, columns and constraints.
    await this.postgresqlDatasourceService.unmount(postgresql);
  }

  /**
   * Overview a postgresql datasource.
   *
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatapipePumpController
   */
  @Get('/:datasourceId/overview')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datapipe.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async overviewPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    /// [step 1] Get postgresql.
    const postgresql = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
      include: {tables: true},
    });
    if (!postgresql) {
      return {
        data: null,
        err: {message: 'Invalid datasourceId.'},
      };
    }

    // [step 2] Overview the datasource.
    const result = await this.postgresqlDatasourceService.overview(postgresql);
    return {
      data: result,
      err: null,
    };
  }
  /* End */
}
