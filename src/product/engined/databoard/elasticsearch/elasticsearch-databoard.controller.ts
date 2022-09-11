import {Controller, Get, Post, Param, Body, Delete} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDataboardService} from './elasticsearch-databoard.service';
import {ElasticsearchDataboardStatus} from '@prisma/client';

@ApiTags('[Product] EngineD / Databoard')
@ApiBearerAuth()
@Controller('elasticsearch-databoards')
export class ElasticsearchDataboardController {
  private elasticsearchDataboardService = new ElasticsearchDataboardService();

  /**
   * Get databoards by page number. The order is by databoard name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof ElasticsearchDataboardController
   */
  @Get('/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the databoard list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getElasticsearchDataboardsByPage(
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
    const databoards = await this.elasticsearchDataboardService.findMany({
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
   * @memberof ElasticsearchDataboardController
   */
  @Get('/:databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    description: 'The uuid of the databoard.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.elasticsearchDataboardService.findOne({
      id: databoardId,
    });
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
   *       name: string;
   *       datasourceType: string;
   *     }} body
   * @returns
   * @memberof ElasticsearchDataboardController
   */
  @Post('/')
  @ApiBody({
    description:
      "The 'name' and 'datasourceType' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'databoard_01',
        },
      },
    },
  })
  async createElasticsearchDataboard(
    @Body()
    body: {
      name: string;
    }
  ) {
    // [step 1] Guard statement.
    if (!body.name) {
      return {
        data: null,
        err: {
          message: 'Please provide valid paramters in the request body.',
        },
      };
    }

    // [step 2] Create databoard.
    const result = await this.elasticsearchDataboardService.create({
      name: body.name,
      status: ElasticsearchDataboardStatus.ACTIVE,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'ElasticsearchDataboard create failed.'},
      };
    }
  }

  /**
   * Update databoard
   *
   * @param {string} databoardId
   * @param {{name: string}} body
   * @returns
   * @memberof ElasticsearchDataboardController
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
  async updateElasticsearchDataboard(
    @Param('databoardId') databoardId: string,
    @Body() body: {name: string}
  ) {
    // [step 1] Guard statement.
    const {name} = body;

    // [step 2] Update name.
    const result = await this.elasticsearchDataboardService.update({
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
        err: {message: 'ElasticsearchDataboard updated failed.'},
      };
    }
  }

  /**
   * Delete databoard
   *
   * @param {string} databoardId
   * @returns
   * @memberof ElasticsearchDataboardController
   */
  @Delete('/:databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deletrElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.elasticsearchDataboardService.delete({
      id: databoardId,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'ElasticsearchDataboard delete failed.'},
      };
    }
  }

  /* End */
}
