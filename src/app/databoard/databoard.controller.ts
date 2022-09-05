import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DataboardService} from './databoard.service';
import {DatasourceType, DataboardStatus} from '@prisma/client';

@ApiTags('App / Databoard')
@ApiBearerAuth()
@Controller('databoards')
export class DataboardController {
  private databoardService = new DataboardService();

  /**
   * Get databoards by page number. The order is by databoard name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DataboardController
   */
  @Get('/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the databoard list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getDataboardsByPage(
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

    // [step 2] Get databoards.
    const databoards = await this.databoardService.findMany({
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
      data: databoards,
      err: null,
    };
  }

  /**
   * Get databoard by id
   *
   * @param {string} databoardId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DataboardController
   */
  @Get('/:databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    description: 'The uuid of the databoard.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.databoardService.findOne({id: databoardId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get databoard failed.'},
      };
    }
  }

  /**
   * Create a new databoard.
   *
   * @param {{
   *       databoardName: string;
   *       clientName: string;
   *       clientEmail: string;
   *     }} body
   * @returns
   * @memberof DataboardController
   */
  @Post('/')
  @ApiBody({
    description:
      "The 'databoardName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'databoard_01',
          datasourceType: DatasourceType.Elasticsearch,
        },
      },
    },
  })
  async createDataboard(
    @Body()
    body: {
      name: string;
      datasourceType: DatasourceType;
    }
  ) {
    // [step 1] Guard statement.
    if (!body.name || !body.datasourceType) {
      return {
        data: null,
        err: {
          message: 'Please provide valid paramters in the request body.',
        },
      };
    }

    // [step 2] Create databoard.
    const result = await this.databoardService.create({
      name: body.name,
      datasourceType: body.datasourceType,
      status: DataboardStatus.PREPARING,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Databoard create failed.'},
      };
    }
  }

  /**
   * Update databoard
   *
   * @param {string} databoardId
   * @param {{name: string}} body
   * @returns
   * @memberof DataboardController
   */
  @Post('/:databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update databoard.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'databoard-01',
        },
      },
    },
  })
  async updateDataboard(
    @Param('databoardId') databoardId: string,
    @Body() body: {name: string}
  ) {
    // [step 1] Guard statement.
    const {name} = body;

    // [step 2] Update name.
    const result = await this.databoardService.update({
      where: {id: databoardId},
      data: {name},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Databoard updated failed.'},
      };
    }
  }

  /* End */
}
