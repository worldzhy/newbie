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
import {PostgresqlDatasourceTableColumnService} from './column.service';

@ApiTags('[Application] EngineD / Postgresql Datasource Table Column')
@ApiBearerAuth()
@Controller('postgresql-datasource-table-columns')
export class PostgresqlDatasourceTableColumnController {
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create column',
        value: {
          columnId: '1',
          name: 'example_column_name',
        },
      },
    },
  })
  async createPostgresqlDatasourceTableColumn(
    @Body() body: Prisma.PostgresqlDatasourceTableColumnUncheckedCreateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
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
    return await this.postgresqlDatasourceTableColumnService.delete({
      where: {id: parseInt(columnId)},
    });
  }

  /* End */
}
