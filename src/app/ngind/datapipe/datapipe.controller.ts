import {Controller, Get, Post, Param, Body, Delete} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatapipeService} from './datapipe.service';
import {DatapipeStatus, PostgresqlDatasourceTable} from '@prisma/client';
import {PostgresqlDatasourceTableService} from '../datasource/postgresql/table/table.service';
import {ElasticsearchDatasourceIndexService} from '../datasource/elasticsearch/index/index.service';

@ApiTags('App / Datapipe')
@ApiBearerAuth()
@Controller('datapipes')
export class DatapipeController {
  private datapipeService = new DatapipeService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();

  /**
   * Get datapipes by page number. The order is by datapipe name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DatapipeController
   */
  @Get('/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the datapipe list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getDatapipesByPage(
    @Param('page') page: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (p < 1) {
      return {
        data: null,
        err: {message: "The 'page' must be a large than 0 integer."},
      };
    }

    // [step 2] Get datapipes.
    const datapipes = await this.datapipeService.findMany({
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
    });
    return {
      data: datapipes,
      err: null,
    };
  }

  /**
   * Get datapipe by id
   *
   * @param {string} datapipeId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatapipeController
   */
  @Get('/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    description: 'The uuid of the datapipe.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async getDatapipe(
    @Param('datapipeId') datapipeId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datapipeService.findOne({
      where: {id: datapipeId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get datapipe failed.'},
      };
    }
  }

  /**
   * Create a new datapipe.
   *
   * @param {{
   *   name: string;
   *   status: DatapipeStatus;
   *   queueUrl?: string;
   *   hasManyTables: string[];
   *   belongsToTables: string[];
   *   fromTableId: number;
   *   toIndexId: number;
   * }} body
   * @returns
   * @memberof DatapipeController
   */
  @Post('/')
  @ApiBody({
    description:
      "The 'datapipeName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'datapipe_01',
          status: DatapipeStatus.INACTIVE,
          queueUrl:
            'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
          withTables: [],
          fromTableId: 1,
          toIndexId: 1,
        },
      },
    },
  })
  async createDatapipe(
    @Body()
    body: {
      name: string;
      status: DatapipeStatus;
      queueUrl?: string;
      hasManyTables: string[];
      belongsToTables: string[];
      fromTableId: number;
      toIndexId: number;
    }
  ) {
    // [step 1] Check if the fromTable and toIndex are existed.
    if (
      !(await this.postgresqlDatasourceTableService.checkExistence(
        body.fromTableId
      ))
    ) {
      return {
        data: null,
        err: {
          message: 'Please provide valid fromTableId in the request body.',
        },
      };
    }
    if (
      !(await this.elasticsearchDatasourceIndexService.checkExistence(
        body.toIndexId
      ))
    ) {
      return {
        data: null,
        err: {
          message: 'Please provide valid toIndexId in the request body.',
        },
      };
    }

    // [step 2] Create datapipe.
    const result = await this.datapipeService.create({
      name: body.name,
      status: DatapipeStatus.INACTIVE,
      queueUrl: body.queueUrl,
      hasManyTables: body.hasManyTables,
      belongsToTables: body.belongsToTables,
      fromTable: {connect: {id: body.fromTableId}},
      toIndex: {connect: {id: body.toIndexId}},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe create failed.'},
      };
    }
  }

  /**
   * Update datapipe
   *
   * @param {string} datapipeId
   * @param {{name: string; hasManyTables: string[]; belongsToTables: string[];}} body
   * @returns
   * @memberof DatapipeController
   */
  @Post('/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  @ApiBody({
    description: 'Update datapipe.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'datapipe-01',
          hasManyTables: [],
          belongsToTables: [],
        },
      },
    },
  })
  async updateDatapipe(
    @Param('datapipeId') datapipeId: string,
    @Body()
    body: {name: string; hasManyTables: string[]; belongsToTables: string[]}
  ) {
    // [step 1] Guard statement.
    const {name, hasManyTables, belongsToTables} = body;

    // [step 2] Update name.
    const result = await this.datapipeService.update({
      where: {id: datapipeId},
      data: {name, hasManyTables, belongsToTables},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe updated failed.'},
      };
    }
  }

  /**
   * Delete datapipe
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeController
   */
  @Delete('/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deleteDatapipe(@Param('datapipeId') datapipeId: string) {
    // [step 1] Guard statement.

    // [step 2] Delete datapipe.
    const result = await this.datapipeService.delete({id: datapipeId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe deleted failed.'},
      };
    }
  }

  /**
   * Probe datapipe
   *
   * @param {string} datapipeId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatapipePumpController
   */
  @Get('/:datapipeId/probe')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    description: 'The uuid of the datapipe.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async probeDatapipeFromTable(
    @Param('datapipeId') datapipeId: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get datapipe.
    const datapipe = await this.datapipeService.findOne({
      where: {id: datapipeId},
      include: {fromTable: true},
    });
    if (!datapipe) {
      return {
        data: null,
        err: {message: 'Get datapipe failed.'},
      };
    }

    // [step 2] Probe the datapipe's fromTable.
    const fromTable = datapipe['fromTable'] as PostgresqlDatasourceTable;
    const probeResult = await this.datapipeService.probe(fromTable);
    return {
      data: probeResult,
      err: null,
    };
  }
  /* End */
}
