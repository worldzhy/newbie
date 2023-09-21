import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDataboardColumnService} from './column.service';
import {ElasticsearchDataboardColumn, Prisma} from '@prisma/client';

@ApiTags('EngineD / Elasticsearch Databoard Column')
@ApiBearerAuth()
@Controller('elasticsearch-databoard-columns')
export class ElasticsearchDataboardColumnController {
  constructor(
    private elasticsearchDataboardColumnService: ElasticsearchDataboardColumnService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'databoard_column_01',
        },
      },
    },
  })
  async createElasticsearchDataboardColumn(
    @Body()
    body: Prisma.ElasticsearchDataboardColumnCreateInput
  ) {
    return await this.elasticsearchDataboardColumnService.create({data: body});
  }

  @Get('')
  async getElasticsearchDataboardColumns(): Promise<
    ElasticsearchDataboardColumn[]
  > {
    return await this.elasticsearchDataboardColumnService.findMany({});
  }

  @Get(':columnId')
  async getElasticsearchDataboardColumn(
    @Param('columnId') columnId: number
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.elasticsearchDataboardColumnService.findUniqueOrThrow({
      where: {id: columnId},
    });
  }

  @Patch(':columnId')
  @ApiBody({
    description: 'Update column.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'databoard-01',
        },
      },
    },
  })
  async updateElasticsearchDataboardColumn(
    @Param('columnId') columnId: number,
    @Body() body: Prisma.ElasticsearchDataboardColumnUpdateInput
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.elasticsearchDataboardColumnService.update({
      where: {id: columnId},
      data: body,
    });
  }

  @Delete(':columnId')
  async deleteElasticsearchDataboardColumn(
    @Param('columnId') columnId: number
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.elasticsearchDataboardColumnService.delete({
      where: {id: columnId},
    });
  }

  /* End */
}
