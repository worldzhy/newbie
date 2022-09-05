import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatapipeService} from './datapipe.service';
import {DatapipeStatus} from '@prisma/client';

@ApiTags('App / Datapipe')
@ApiBearerAuth()
@Controller('datapipes')
export class DatapipeController {
  private datapipeService = new DatapipeService();

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
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatapipe(
    @Param('datapipeId') datapipeId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datapipeService.findOne({id: datapipeId});
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
   *       datapipeName: string;
   *       clientName: string;
   *       clientEmail: string;
   *     }} body
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
        },
      },
    },
  })
  async createDatapipe(
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

    // [step 2] Create datapipe.
    const result = await this.datapipeService.create({
      name: body.name,
      status: DatapipeStatus.PREPARING,
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
   * @param {{name: string}} body
   * @returns
   * @memberof DatapipeController
   */
  @Post('/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update datapipe.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'datapipe-01',
        },
      },
    },
  })
  async updateDatapipe(
    @Param('datapipeId') datapipeId: string,
    @Body() body: {name: string}
  ) {
    // [step 1] Guard statement.
    const {name} = body;

    // [step 2] Update name.
    const result = await this.datapipeService.update({
      where: {id: datapipeId},
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
        err: {message: 'Datapipe updated failed.'},
      };
    }
  }

  /* End */
}
