import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ElasticsearchDatasourceIndexField, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('EngineD / Elasticsearch Datasource Index Field')
@ApiBearerAuth()
@Controller('elasticsearch-datasource-index-fields')
export class ElasticsearchDatasourceIndexFieldController {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.elasticsearchDatasourceIndexField.create({
      data: body,
    });
  }

  @Get('')
  async getElasticsearchDatasourceIndexFields(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {}

  @Get(':indexId')
  async getElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndexField | null> {
    return await this.prisma.elasticsearchDatasourceIndexField.findUnique({
      where: {id: indexId},
    });
  }

  @Patch(':indexId')
  async updateElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: number,
    @Body() body: Prisma.ElasticsearchDatasourceIndexFieldUpdateInput
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.update({
      where: {id: indexId},
      data: body,
    });
  }

  @Delete(':indexId')
  async deleteElasticsearchDatasourceIndexField(
    @Param('indexId') indexId: number
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.delete({
      where: {id: indexId},
    });
  }

  /* End */
}
