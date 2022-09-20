import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDataboardColumnService} from './column.service';
import {ElasticsearchDataboardColumn, Prisma} from '@prisma/client';

@ApiTags('[Application] EngineD / Databoard / Elasticsearch / Column')
@ApiBearerAuth()
@Controller('elasticsearch-databoard-columns')
export class ElasticsearchDataboardColumnController {
  private elasticsearchDataboardColumnService =
    new ElasticsearchDataboardColumnService();

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
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    description: 'The uuid of the databoard.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDataboardColumn(
    @Param('columnId') columnId: string
  ): Promise<ElasticsearchDataboardColumn | null> {
    return await this.elasticsearchDataboardColumnService.findUnique({
      where: {id: parseInt(columnId)},
    });
  }

  @Patch(':columnId')
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
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
    @Param('columnId') columnId: string,
    @Body() body: Prisma.ElasticsearchDataboardColumnUpdateInput
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.elasticsearchDataboardColumnService.update({
      where: {id: parseInt(columnId)},
      data: body,
    });
  }

  @Delete(':columnId')
  @ApiParam({
    name: 'columnId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteElasticsearchDataboardColumn(
    @Param('columnId') columnId: string
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.elasticsearchDataboardColumnService.delete({
      where: {id: parseInt(columnId)},
    });
  }

  /* End */
}
