import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {PostgresqlDatasourceService} from '../postgresql-datasource.service';
import {PostgresqlDatasourceConstraintService} from './constraint.service';

@ApiTags('[Application] EngineD / Datasource / Postgresql / Constraint')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceConstraintController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceConstraintService =
    new PostgresqlDatasourceConstraintService();

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
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.postgresqlDatasourceConstraintService.findMany({
      where: {
        datasourceId: datasourceId,
      },
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {
          message: 'Get postgresql datasource constraints failed.',
        },
      };
    }
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

    // [step 2] Get columns group by table.
    const relations = await this.postgresqlDatasourceConstraintService.findMany(
      {
        where: {
          AND: {
            datasourceId: datasource.id,
            table: tableName,
          },
        },
      }
    );

    if (relations.length > 0) {
      return {
        data: relations,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql datasource constraints failed.'},
      };
    }
  }
  /* End */
}
