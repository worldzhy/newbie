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
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PostgresqlDatasourceTableService} from '../table/table.service';
import {PostgresqlDatasourceTableColumnService} from './column.service';

@ApiTags('EngineD / Postgresql Datasource Table Column')
@ApiBearerAuth()
@Controller('postgresql-datasource-table-columns')
export class PostgresqlDatasourceTableColumnController {
  constructor(
    private readonly postgresqlDatasourceTableService: PostgresqlDatasourceTableService,
    private readonly postgresqlDatasourceTableColumnService: PostgresqlDatasourceTableColumnService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create column',
        value: {
          name: 'example_column_name',
          type: 'VARCHAR(10)',
          tableId: 1,
        },
      },
    },
  })
  async createPostgresqlDatasourceTableColumn(
    @Body() body: Prisma.PostgresqlDatasourceTableColumnUncheckedCreateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
    // [step 1] Get the table.
    const table = await this.postgresqlDatasourceTableService.findUniqueOrThrow(
      {where: {id: body.tableId}}
    );

    // [step 2] Add column in postgresql table.
    await this.postgresqlDatasourceTableColumnService.addColulmn({
      table: table.name,
      name: body.name,
      type: body.type,
      constraint: body.constraint,
    });

    // [step 3] Save column record in database.
    return await this.postgresqlDatasourceTableColumnService.create({
      data: body,
    });
  }

  @Get('')
  async getPostgresqlDatasourceTableColumns(): Promise<
    PostgresqlDatasourceTableColumn[]
  > {
    return await this.postgresqlDatasourceTableColumnService.findMany({});
  }

  @Get(':columnId')
  async getPostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: number
  ): Promise<PostgresqlDatasourceTableColumn | null> {
    return await this.postgresqlDatasourceTableColumnService.findUnique({
      where: {id: columnId},
    });
  }

  @Patch(':columnId')
  async updatePostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: number,
    @Body() body: Prisma.ElasticsearchDatasourceIndexUpdateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.postgresqlDatasourceTableColumnService.update({
      where: {id: columnId},
      data: body,
    });
  }

  @Delete(':columnId')
  async deletePostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: number
  ): Promise<PostgresqlDatasourceTableColumn> {
    // [step 1] Get the column.
    const column =
      await this.postgresqlDatasourceTableColumnService.findUniqueOrThrow({
        where: {id: columnId},
        include: {table: true},
      });

    // [step 2] Drop column in postgresql table.
    await this.postgresqlDatasourceTableColumnService.dropColulmn(column);

    // [step 3] Delete column record in database.
    return await this.postgresqlDatasourceTableColumnService.delete({
      where: {id: columnId},
    });
  }

  /* End */
}
