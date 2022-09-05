import {Controller, Get, Post, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatasourcePostgresqlService} from '../postgresql.service';
import {DatasourcePostgresqlTableRelationService} from './table-relation.service';

@ApiTags('App / Datasource')
@ApiBearerAuth()
@Controller('datasource')
export class DatasourcePostgresqlTableRelationController {
  private datasourcePostgresqlService = new DatasourcePostgresqlService();
  private datasourcePostgresqlTableRelationService =
    new DatasourcePostgresqlTableRelationService();

  /**
   * Get datasourceDatasourcePostgresql table relations
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlTableRelationController
   */
  @Get('/postgresql/:datasourceId/tables/relations')
  @ApiParam({
    name: 'datasourceId',
    schema: {type: 'string'},
    description: 'The uuid of the datasourceDatasourcePostgresqlTableRelation.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatasourcePostgresqlTableRelations(
    @Param('datasourceId')
    datasourceId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datasourcePostgresqlTableRelationService.findMany(
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
          message: 'Get datasourceDatasourcePostgresql table relation failed.',
        },
      };
    }
  }

  /**
   * Get postgresql table relations
   * @param {string} datasourceId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatasourcePostgresqlTableColumnController
   */
  @Get('/postgresql/:datasourceId/tables/:tableName/relations')
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
  async getDatasourcePostgresqlRelationsByTable(
    @Param('datasourceId') datasourceId: string,
    @Param('tableName') tableName: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datasource.
    const datasource = await this.datasourcePostgresqlService.findOne({
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
      await this.datasourcePostgresqlTableRelationService.findMany({
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
