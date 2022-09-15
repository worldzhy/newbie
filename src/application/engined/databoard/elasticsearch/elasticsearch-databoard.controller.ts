import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDataboardService} from './elasticsearch-databoard.service';
import {ElasticsearchDataboard, Prisma} from '@prisma/client';

@ApiTags('[Application] EngineD / Databoard')
@ApiBearerAuth()
@Controller('elasticsearch-databoards')
export class ElasticsearchDataboardController {
  private elasticsearchDataboardService = new ElasticsearchDataboardService();

  @Post('')
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
    body: Prisma.ElasticsearchDataboardCreateInput
  ) {
    return await this.elasticsearchDataboardService.create({data: body});
  }

  @Get('')
  @ApiParam({
    required: false,
    name: 'name',
    description: 'The string you want to search in the pool.',
    example: 'databoard01',
    schema: {type: 'string'},
  })
  @ApiParam({
    required: false,
    name: 'page',
    schema: {type: 'number'},
    description: 'The page of the list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getElasticsearchDataboards(
    @Query() query: {name?: string; page?: string}
  ): Promise<ElasticsearchDataboard[] | {err: {message: string}}> {
    // [step 1] Construct where argument.
    let where: Prisma.ElasticsearchDataboardWhereInput | undefined;
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        where = {name: {search: name}};
      }
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      if (page > 0) {
        take = 10;
        skip = 10 * (page - 1);
      } else {
        return {err: {message: 'The page must be larger than 0.'}};
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get databoards.
    return await this.elasticsearchDataboardService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    description: 'The uuid of the databoard.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard | null> {
    return await this.elasticsearchDataboardService.findUnique({
      where: {id: databoardId},
    });
  }

  @Patch(':databoardId')
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
    @Body() body: Prisma.ElasticsearchDataboardUpdateInput
  ): Promise<ElasticsearchDataboard> {
    return await this.elasticsearchDataboardService.update({
      where: {id: databoardId},
      data: body,
    });
  }

  @Delete(':databoardId')
  @ApiParam({
    name: 'databoardId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteElasticsearchDataboard(
    @Param('databoardId') databoardId: string
  ): Promise<ElasticsearchDataboard> {
    return await this.elasticsearchDataboardService.delete({
      where: {id: databoardId},
    });
  }

  /* End */
}
