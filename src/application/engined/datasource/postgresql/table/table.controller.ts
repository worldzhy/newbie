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
  constructor(
    private postgresqlDatasourceTableService: PostgresqlDatasourceTableService
  ) {}

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
    schema: {type: 'number'},
    description: 'The id of the table.',
    example: 1,
  })
  async getPostgresqlDatasourceTable(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.postgresqlDatasourceTableService.findUnique({
      where: {id: tableId},
    });
  }

  @Patch(':tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndex(
    @Param('tableId') tableId: number,
    @Body() body: Prisma.PostgresqlDatasourceTableUpdateInput
  ): Promise<PostgresqlDatasourceTable> {
    return await this.postgresqlDatasourceTableService.update({
      where: {id: tableId},
      data: body,
    });
  }

  @Delete(':tableId')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    example: 1,
  })
  async deletePostgresqlDatasourceTable(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTable> {
    // [step 1] Get the table.
    const table = await this.postgresqlDatasourceTableService.findUniqueOrThrow(
      {where: {id: tableId}}
    );

    // [step 2] Delete table in Postgresql.
    await this.postgresqlDatasourceTableService.dropTable(table.name);

    // [step 3] Delete the table record in database.
    return await this.postgresqlDatasourceTableService.delete({
      where: {id: tableId},
    });
  }

  @Get(':tableId/columns')
  @ApiParam({
    name: 'tableId',
    schema: {type: 'number'},
    description: 'The uuid of the table.',
    example: 1,
  })
  async getPostgresqlDatasourceColumns(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTable> {
    return await this.postgresqlDatasourceTableService.findUniqueOrThrow({
      where: {id: tableId},
      include: {columns: true},
    });
  }

  /* End */
}
