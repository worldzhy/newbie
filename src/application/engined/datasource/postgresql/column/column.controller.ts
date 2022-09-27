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
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PostgresqlDatasourceTableService} from '../table/table.service';
import {PostgresqlDatasourceTableColumnService} from './column.service';

@ApiTags('[Application] EngineD / Postgresql Datasource Table Column')
@ApiBearerAuth()
@Controller('postgresql-datasource-table-columns')
export class PostgresqlDatasourceTableColumnController {
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();

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
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 1,
  })
  async getPostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: string
  ): Promise<PostgresqlDatasourceTableColumn | null> {
    return await this.postgresqlDatasourceTableColumnService.findUnique({
      where: {id: parseInt(columnId)},
    });
  }

  @Patch(':columnId')
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    example: 1,
  })
  async updatePostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: string,
    @Body() body: Prisma.ElasticsearchDatasourceIndexUpdateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.postgresqlDatasourceTableColumnService.update({
      where: {id: parseInt(columnId)},
      data: body,
    });
  }

  @Delete(':columnId')
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    example: 1,
  })
  async deletePostgresqlDatasourceTableColumn(
    @Param('columnId') columnId: string
  ): Promise<PostgresqlDatasourceTableColumn> {
    // [step 1] Get the column.
    const column =
      await this.postgresqlDatasourceTableColumnService.findUniqueOrThrow({
        where: {id: parseInt(columnId)},
        include: {table: true},
      });

    // [step 2] Drop column in postgresql table.
    await this.postgresqlDatasourceTableColumnService.dropColulmn(column);

    // [step 3] Delete column record in database.
    return await this.postgresqlDatasourceTableColumnService.delete({
      where: {id: parseInt(columnId)},
    });
  }

  /* End */
}
