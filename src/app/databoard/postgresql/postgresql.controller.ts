import {Controller, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DataboardPostgresqlService} from './postgresql.service';
import {Prisma} from '@prisma/client';

@ApiTags('App / Databoard')
@ApiBearerAuth()
@Controller('databoards')
export class DataboardPostgresqlController {
  private databoardPostgresqlService = new DataboardPostgresqlService();

  /**
   * Get databoards by page number. The order is by databoard name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DataboardController
   */
  @Post('/:databoardId/data/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the databoard data. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  @ApiBody({
    description: 'Get databoard data.',
    examples: {
      a: {
        summary: '1. Get ',
        value: {
          where: {createdAt: {gt: new Date()}},
          orderBy: {name: 'asc'},
        },
      },
    },
  })
  async getDataboardDataByPage(
    @Param('page') page: number,
    @Body()
    body: {
      take?: number;
      where?: Prisma.DataboardWhereInput;
      orderBy?: Prisma.DataboardOrderByWithRelationAndSearchRelevanceInput;
    }
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
    const take = body.take ? body.take : 10;
    const databoards = await this.databoardPostgresqlService.findMany({
      where: body.where,
      orderBy: body.orderBy,
      take: take,
      skip: take * (p - 1),
    });
    return {
      data: databoards,
      err: null,
    };
  }

  /* End */
}
