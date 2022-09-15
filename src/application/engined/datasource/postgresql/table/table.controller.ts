import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PostgresqlDatasourceService} from '../postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './table.service';

@ApiTags('[Application] EngineD / Datasource / Postgresql / Table')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceTableController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();

  @Post('/:datasourceId/tables')
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
  async createPostgresqlDatasourceTable(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {name: string}
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid datasource id.'},
      };
    }

    // [step 2] Create table.
    const index = await this.postgresqlDatasourceTableService.create({
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
        err: {message: 'Create postgresql table failed.'},
      };
    }
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
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.postgresqlDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid postgresql id.'},
      };
    }

    // [step 2] Get tables.
    const tables = await this.postgresqlDatasourceTableService.findMany({
      where: {
        datasourceId: datasource.id,
      },
      orderBy: {name: 'asc'},
    });

    return {
      data: tables,
      err: null,
    };
  }

  @Get('/tables/:tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceTable(
    @Param('datasourceId') tableId: number
  ): Promise<{data: object | null; err: object | null}> {
    const table = await this.postgresqlDatasourceTableService.findUnique({
      where: {id: tableId},
    });

    if (table) {
      return {
        data: table,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Invalid table id.'},
      };
    }
  }

  /* End */
}
