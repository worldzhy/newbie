import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {PostgresqlDatasourceTable, Prisma} from '@prisma/client';
import {PostgresqlDatasourceTableService} from './table.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Datasource - Postgresql')
@ApiBearerAuth()
@Controller('postgresql-datasource-tables')
export class PostgresqlDatasourceTableController {
  constructor(
    private readonly prisma: PrismaService,
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
    return await this.prisma.postgresqlDatasourceTable.create({
      data: body,
    });
  }

  @Get('')
  async getPostgresqlDatasourceTables(): Promise<PostgresqlDatasourceTable[]> {
    return await this.prisma.postgresqlDatasourceTable.findMany({});
  }

  @Get(':tableId')
  async getPostgresqlDatasourceTable(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.prisma.postgresqlDatasourceTable.findUnique({
      where: {id: tableId},
    });
  }

  @Patch(':tableId')
  async updateElasticsearchDatasourceIndex(
    @Param('tableId') tableId: number,
    @Body() body: Prisma.PostgresqlDatasourceTableUpdateInput
  ): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.update({
      where: {id: tableId},
      data: body,
    });
  }

  @Delete(':tableId')
  async deletePostgresqlDatasourceTable(
    @Param('tableId') tableId: number
  ): Promise<PostgresqlDatasourceTable> {
    // [step 1] Get the table.
    const table = await this.prisma.postgresqlDatasourceTable.findUniqueOrThrow(
      {where: {id: tableId}}
    );

    // [step 2] Delete table in Postgresql.
    await this.postgresqlDatasourceTableService.dropTable(table.name);

    // [step 3] Delete the table record in database.
    return await this.prisma.postgresqlDatasourceTable.delete({
      where: {id: tableId},
    });
  }

  @Get(':tableId/columns')
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
