import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {PostgresqlDatasourceTableColumnService} from './column.service';

@ApiTags('[Product] EngineD / Datasource / Postgresql / Table')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceTableColumnController {
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();

  @Get('/tables/:tableId/columns')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceColumns(
    @Param('tableId') tableId: number
  ): Promise<{data: object | null; err: object | null}> {
    const columns = await this.postgresqlDatasourceTableColumnService.findMany({
      where: {tableId: tableId},
      orderBy: {ordinalPosition: 'asc'},
    });

    return {
      data: columns,
      err: null,
    };
  }

  /* End */
}
