import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDatasourceIndex,
  ElasticsearchDatasourceIndexField,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDatasourceIndexFieldService} from '../field/field.service';
import {ElasticsearchDatasourceIndexService} from './index.service';

@ApiTags('[Application] EngineD / Datasource / Elasticsearch / Index')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceIndexController {
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();
  private elasticsearchDatasourceIndexFieldService =
    new ElasticsearchDatasourceIndexFieldService();

  @Post('indices')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create index',
        value: {
          datasourceId: 'd8141ece-f242-4288-a60a-8675538549cd',
          name: 'example_index_name',
        },
      },
    },
  })
  async createElasticsearchDatasourceIndex(
    @Body() body: Prisma.ElasticsearchDatasourceIndexUncheckedCreateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.create({
      data: body,
    });
  }

  @Get('indices')
  async getElasticsearchDatasourceIndices(): Promise<
    ElasticsearchDatasourceIndex[]
  > {
    return await this.elasticsearchDatasourceIndexService.findMany({});
  }

  @Get('indices/:indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The uuid of the datasource.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.elasticsearchDatasourceIndexService.findUnique({
      where: {id: indexId},
    });
  }

  @Patch('indices/:indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number,
    @Body() body: Prisma.ElasticsearchDatasourceIndexUpdateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.update({
      where: {id: indexId},
      data: body,
    });
  }

  @Delete('indices/:indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteElasticsearchDatasourceIndex(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.elasticsearchDatasourceIndexService.delete({
      where: {id: indexId},
    });
  }

  @Get('indices/:indexId/fields')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'number'},
    description: 'The uuid of the index.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getElasticsearchDatasourceIndexFields(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndexField[] | {err: {message: string}}> {
    // [step 1] Get index.
    const index = await this.elasticsearchDatasourceIndexService.findUnique({
      where: {id: indexId},
    });
    if (!index) {
      return {err: {message: 'Invalid index id.'}};
    }

    // [step 2] Get fields group by index.
    return await this.elasticsearchDatasourceIndexFieldService.findMany({
      where: {indexId: indexId},
    });
  }

  /* End */
}
