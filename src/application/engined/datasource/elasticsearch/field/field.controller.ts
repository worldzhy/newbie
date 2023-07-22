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
import {ElasticsearchDatasourceIndexField, Prisma} from '@prisma/client';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';

@ApiTags('[Application] EngineD / Elasticsearch Datasource Index Field')
@ApiBearerAuth()
@Controller('elasticsearch-datasource-index-fields')
export class ElasticsearchDatasourceIndexFieldController {
  constructor(
    private elasticsearchDatasourceIndexFieldService: ElasticsearchDatasourceIndexFieldService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create field',
        value: {
          indexId: '1',
          name: 'example_index_field_name',
        },
      },
    },
  })
  async createElasticsearchDatasourceIndexField(
    @Body() body: Prisma.ElasticsearchDatasourceIndexFieldUncheckedCreateInput
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.elasticsearchDatasourceIndexFieldService.create({
      data: body,
    });
  }

  @Get('')
  async getElasticsearchDatasourceIndexFields(): Promise<
    ElasticsearchDatasourceIndexField[]
  > {
    return await this.elasticsearchDatasourceIndexFieldService.findMany({});
  }

  @Get(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    description: 'The uuid of the datasource.',
    example: 1,
  })
  async getElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: string
  ): Promise<ElasticsearchDatasourceIndexField | null> {
    return await this.elasticsearchDatasourceIndexFieldService.findUnique({
      where: {id: parseInt(indexId)},
    });
  }

  @Patch(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    example: 1,
  })
  async updateElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: string,
    @Body() body: Prisma.ElasticsearchDatasourceIndexFieldUpdateInput
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.elasticsearchDatasourceIndexFieldService.update({
      where: {id: parseInt(indexId)},
      data: body,
    });
  }

  @Delete(':indexId')
  @ApiParam({
    name: 'indexId',
    schema: {type: 'string'},
    example: 1,
  })
  async deleteElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: string
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.elasticsearchDatasourceIndexFieldService.delete({
      where: {id: parseInt(indexId)},
    });
  }

  /* End */
}
