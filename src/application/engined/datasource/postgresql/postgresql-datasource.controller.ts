import {Controller, Get, Post, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  PostgresqlDatasource,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasourceTable,
} from '@prisma/client';
import {PostgresqlDatasourceConstraintService} from './constraint/constraint.service';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './table/table.service';

@ApiTags('[Application] EngineD / Datasource / Postgresql')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private postgresqlDatasourceConstraintService =
    new PostgresqlDatasourceConstraintService();

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
  ): Promise<PostgresqlDatasource> {
    return await this.postgresqlDatasourceService.create({
      ...body,
    });
  }

  @Get('/')
  async getPostgresqlDatasources(): Promise<PostgresqlDatasource[]> {
    return await this.postgresqlDatasourceService.findMany({
      orderBy: {
        _relevance: {
          fields: ['database'],
          search: 'database',
          sort: 'asc',
        },
      },
    });
  }

  @Get('/:datasourceId')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresql datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource | null> {
    return await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
  }

  @Patch('/:datasourceId')
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
  ): Promise<PostgresqlDatasource> {
    return await this.postgresqlDatasourceService.update({
      where: {id: datasourceId},
      data: {...body},
    });
  }

  @Get('/:datasourceId/tables')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceTables(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasourceTable[] | {err: {message: string}}> {
    // [step 1] Get datasource.
    const datasource = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {err: {message: 'Invalid postgresql id.'}};
    }

    // [step 2] Get tables.
    return await this.postgresqlDatasourceTableService.findMany({
      where: {
        datasourceId: datasource.id,
      },
      orderBy: {name: 'asc'},
    });
  }

  @Get('/:datasourceId/constraints')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresql datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceConstraints(
    @Param('datasourceId')
    datasourceId: string
  ): Promise<PostgresqlDatasourceConstraint[]> {
    return await this.postgresqlDatasourceConstraintService.findMany({
      where: {
        datasourceId: datasourceId,
      },
    });
  }

  @Get('/:datasourceId/constraints/:tableName')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiParam({
    name: 'tableName',
    schema: {type: 'string'},
    description: 'The name of the table.',
    example: 'User',
  })
  async getPostgresqlDatasourceConstraintsByTable(
    @Param('datasourceId') datasourceId: string,
    @Param('tableName') tableName: string
  ): Promise<PostgresqlDatasourceConstraint[] | {err: {message: string}}> {
    // [step 1] Get datasource.
    const datasource = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {err: {message: 'Invalid postgresql id.'}};
    }

    // [step 2] Get columns group by table.
    return await this.postgresqlDatasourceConstraintService.findMany({
      where: {
        AND: {
          datasourceId: datasource.id,
          table: tableName,
        },
      },
    });
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
