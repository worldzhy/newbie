import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PostgresqlDatasourceTable, Prisma} from '@prisma/client';
import {PostgresqlDatasourceTableService} from './table.service';

@ApiTags('[Application] EngineD / Postgresql Datasource Table')
@ApiBearerAuth()
@Controller('postgresql-datasource-tables')
export class PostgresqlDatasourceTableController {
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create table',
        value: {
          datasourceId: 'd8141ece-f242-4288-a60a-8675538549cd',
          name: 'example_table_name',
        },
      },
    },
  })
  async createPostgresqlDatasourceTable(
    @Body() body: Prisma.PostgresqlDatasourceTableUncheckedCreateInput
  ): Promise<PostgresqlDatasourceTable> {
    // [step 1] Create table in Postgresql.
    await this.postgresqlDatasourceTableService.createTable(body.name);

    // [step 2] Save the table record in database.
    return await this.postgresqlDatasourceTableService.create({
      data: body,
    });
  }

  @Get('')
  async getPostgresqlDatasourceTables(): Promise<PostgresqlDatasourceTable[]> {
    return await this.postgresqlDatasourceTableService.findMany({});
  }

  @Get(':tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'string'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceTable(
    @Param('tableId') tableId: string
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.postgresqlDatasourceTableService.findUnique({
      where: {id: parseInt(tableId)},
    });
  }

  @Patch(':tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'string'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndex(
    @Param('tableId') tableId: string,
    @Body() body: Prisma.PostgresqlDatasourceTableUpdateInput
  ): Promise<PostgresqlDatasourceTable> {
    return await this.postgresqlDatasourceTableService.update({
      where: {id: parseInt(tableId)},
      data: body,
    });
  }

  @Delete(':tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'string'},
    example: 1,
  })
  async deletePostgresqlDatasourceTable(
    @Param('tableId') tableId: string
  ): Promise<PostgresqlDatasourceTable> {
    // [step 1] Get the table.
    const table = await this.postgresqlDatasourceTableService.findUniqueOrThrow(
      {where: {id: parseInt(tableId)}}
    );

    // [step 2] Delete table in Postgresql.
    await this.postgresqlDatasourceTableService.dropTable(table.name);

    // [step 3] Delete the table record in database.
    return await this.postgresqlDatasourceTableService.delete({
      where: {id: parseInt(tableId)},
    });
  }

  @Get(':tableId/columns')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'string'},
    description: 'The uuid of the table.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceColumns(
    @Param('tableId') tableId: string
  ): Promise<PostgresqlDatasourceTable> {
    return await this.postgresqlDatasourceTableService.findUniqueOrThrow({
      where: {id: parseInt(tableId)},
      include: {columns: true},
    });
  }

  /* End */
}
