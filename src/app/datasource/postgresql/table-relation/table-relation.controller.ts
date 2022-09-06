import {Controller, Get, Post, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {PostgresqlDatasourceService} from '../postgresql-datasource.service';
import {PostgresqlDatasourceTableRelationService} from './table-relation.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceTableRelationController {
  private postgresqlDatasourceService = new PostgresqlDatasourceService();
  private postgresqlDatasourceTableRelationService =
    new PostgresqlDatasourceTableRelationService();

  /**
   * Get postgresqlDatasourceDatasource table relations
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof PostgresqlDatasourceTableRelationController
   */
  @Get('/:datasourceId/tables/relations')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the postgresqlDatasourceDatasourceTableRelation.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getPostgresqlDatasourceTableRelations(
    @Param('datasourceId')
    datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.postgresqlDatasourceTableRelationService.findMany(
      {
        where: {
          datasourceId: datasourceId,
        },
      }
    );
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {
          message: 'Get postgresqlDatasourceDatasource table relation failed.',
        },
      };
    }
  }

  /**
   * Get postgresql table relations
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof PostgresqlDatasourceTableColumnController
   */
  @Get('/:datasourceId/tables/:tableName/relations')
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
  async getPostgresqlDatasourceRelationsByTable(
    @Param('datasourceId') datasourceId: string,
    @Param('tableName') tableName: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.postgresqlDatasourceService.findOne({
      id: datasourceId,
    });
    if (!datasource) {
      return {
        data: null,
        err: {message: 'Invalid postgresql id.'},
      };
    }

    // [step 2] Get columns group by table.
    const relations =
      await this.postgresqlDatasourceTableRelationService.findMany({
        where: {
          AND: {
            datasourceId: datasource.id,
            table: tableName,
          },
        },
      });

    if (relations.length > 0) {
      return {
        data: relations,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get postgresql table column failed.'},
      };
    }
  }
  /* End */
}
