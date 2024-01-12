import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDatasource,
  ElasticsearchDatasourceState,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Datasource - Elasticsearch')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchDatasourceService: ElasticsearchDatasourceService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'node' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {node: '24.323.232.23'},
      },
    },
  })
  async createElasticsearchDatasource(
    @Body()
    body: Prisma.ElasticsearchDatasourceCreateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.create({data: body});
  }

  @Get('')
  async getElasticsearchDatasources(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ElasticsearchDatasource,
      pagination: {page, pageSize},
    });
  }

  @Get(':datasourceId')
  async getElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource | null> {
    return await this.prisma.elasticsearchDatasource.findUnique({
      where: {id: datasourceId},
    });
  }

  @Patch(':datasourceId')
  @ApiBody({
    description: 'Update elasticsearch datasource.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          node: '12.323.232.23',
        },
      },
    },
  })
  async updateElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body() body: Prisma.ElasticsearchDatasourceUpdateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.update({
      where: {id: datasourceId},
      data: body,
    });
  }

  @Delete(':datasourceId')
  async deleteElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.delete({
      where: {id: datasourceId},
    });
  }

  /**
   * Load an elasticsearch datasource.
   */
  @Patch(':datasourceId/load')
  async loadElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    // [step 1] Get datasource.
    const datasource = await this.prisma.elasticsearchDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Get mappings of all indices.
    const result =
      await this.elasticsearchDatasourceService.getMapping(datasource);

    // [step 3] Save fields of all indices.
    const indexNames = Object.keys(result.body);
    for (let i = 0; i < indexNames.length; i++) {
      const indexName = indexNames[i];
      if (indexName.startsWith('.')) {
        // The index name starts with '.' is not the customized index name.
        continue;
      }

      // Save the index.
      const index = await this.prisma.elasticsearchDatasourceIndex.create({
        data: {
          name: indexName,
          datasource: {connect: {id: datasource.id}},
        },
      });

      // Save fields of the index if they exist.
      if ('properties' in result.body[indexName].mappings) {
        const fieldNames = Object.keys(
          result.body[indexName].mappings.properties
        );
        await this.prisma.elasticsearchDatasourceIndexField.createMany({
          data: fieldNames.map(fieldName => {
            return {
              name: fieldName,
              type: result.body[indexName].mappings.properties[fieldName].type,
              properties:
                result.body[indexName].mappings.properties[fieldName]
                  .properties,
              indexId: index.id,
            };
          }),
        });
      }
    }

    // [step 4] Update datasource state.
    return await this.prisma.elasticsearchDatasource.update({
      where: {id: datasource.id},
      data: {state: ElasticsearchDatasourceState.LOADED},
    });
  }

  /**
   * Unload an elasticsearch datasource.
   */
  @Patch(':datasourceId/unload')
  async unloadPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    // [step 1] Get datasource.
    const datasource = await this.prisma.elasticsearchDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Delete indices, their fields will be cascade deleted.
    await this.prisma.elasticsearchDatasourceIndex.deleteMany({
      where: {datasourceId: datasource.id},
    });

    // [step 3] Update datasource state.
    return await this.prisma.elasticsearchDatasource.update({
      where: {id: datasource.id},
      data: {state: ElasticsearchDatasourceState.NOT_LOADED},
    });
  }

  @Get(':datasourceId/indices')
  async getElasticsearchDatasourceIndices(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.findUniqueOrThrow({
      where: {id: datasourceId},
      include: {indices: true},
    });
  }

  @Post(':datasourceId/search')
  @ApiBody({
    description: 'Search elasticsearch datasource.',
    examples: {
      a: {
        summary: '1. Search',
        value: {
          index: 'users',
          body: {},
          from: 0,
          size: 10,
          sort: [],
        },
      },
    },
  })
  async searchElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body()
    body: {
      index: string;
      body: JSON;
      from: number;
      size: number;
      sort: string[];
    }
  ) {
    // [step 1] Get datasource.
    const datasource = await this.prisma.elasticsearchDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Search datasource.
    return await this.elasticsearchDatasourceService.search(body);
  }

  @Post(':datasourceId/search-aggregations')
  @ApiBody({
    description: 'Search aggregations.',
    examples: {
      a: {
        summary: '1. Search aggregations',
        value: {
          aggregationMode: null,
          option: {},
          searchDto: {},
          type: 'terms',
        },
      },
    },
  })
  async searchAggregationsElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body()
    body: {
      aggregationMode: string;
      option: JSON;
      searchDto: JSON;
      type: string;
    }
  ) {
    // [step 1] Get datasource.
    const datasource = await this.prisma.elasticsearchDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Search datasource.
    return await this.elasticsearchDatasourceService.searchAggregations(body);
  }

  /* End */
}
