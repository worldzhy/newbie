import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  PostgresqlDatasourceTable,
  PostgresqlDatasourceTableColumn,
  Prisma,
} from '@prisma/client';
import {PostgresqlDatasourceTableColumnService} from '../column/column.service';
import {PostgresqlDatasourceTableService} from './table.service';

@ApiTags('[Application] EngineD / Datasource / Postgresql / Table')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceTableController {
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();

  @Post('tables')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create index',
        value: {
          datasourceId: 'd8141ece-f242-4288-a60a-8675538549cd',
          name: 'example_index_name',
        },
      },
    },
  })
  async createPostgresqlDatasourceTable(
    @Body() body: Prisma.PostgresqlDatasourceTableUncheckedCreateInput
  ): Promise<PostgresqlDatasourceTable> {
    return await this.postgresqlDatasourceTableService.create({
      data: body,
    });
  }

  @Get('tables')
  async getPostgresqlDatasourceTables(): Promise<PostgresqlDatasourceTable[]> {
    return await this.postgresqlDatasourceTableService.findMany({});
  }

  @Get('tables/:tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceTable(
    @Param('datasourceId') tableId: number
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.postgresqlDatasourceTableService.findUnique({
      where: {id: tableId},
    });
  }

  @Get('tables/:tableId/columns')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceColumns(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTableColumn[]> {
    return await this.postgresqlDatasourceTableColumnService.findMany({
      where: {tableId: tableId},
      orderBy: {ordinalPosition: 'asc'},
    });
  }
  /* End */
}
