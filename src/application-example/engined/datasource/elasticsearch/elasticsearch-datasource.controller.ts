import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  ElasticsearchDatasource,
  ElasticsearchDatasourceState,
  Prisma,
} from '@prisma/client';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexFieldService} from './field/field.service';
import {ElasticsearchDatasourceIndexService} from './index/index.service';

@ApiTags('EngineD / Elasticsearch Datasource')
@ApiBearerAuth()
@Controller('elasticsearch-datasources')
export class ElasticsearchDatasourceController {
  constructor(
    private readonly elasticsearchDatasourceService: ElasticsearchDatasourceService,
    private readonly elasticsearchDatasourceIndexService: ElasticsearchDatasourceIndexService,
    private readonly elasticsearchDatasourceIndexFieldService: ElasticsearchDatasourceIndexFieldService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'node' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          node: '24.323.232.23',
        },
      },
    },
  })
  async createElasticsearchDatasource(
    @Body()
    body: Prisma.ElasticsearchDatasourceCreateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.create({data: body});
  }

  @Get('')
  async getElasticsearchDatasources(): Promise<ElasticsearchDatasource[]> {
    return await this.elasticsearchDatasourceService.findMany({});
  }

  @Get(':datasourceId')
  async getElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource | null> {
    return await this.elasticsearchDatasourceService.findUnique({
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
    return await this.elasticsearchDatasourceService.update({
      where: {id: datasourceId},
      data: body,
    });
  }

  @Delete(':datasourceId')
  async deleteElasticsearchDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.delete({
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
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Get mappings of all indices.
    const result = await this.elasticsearchDatasourceService.getMapping(
      datasource
    );

    // [step 3] Save fields of all indices.
    const indexNames = Object.keys(result.body);
    for (let i = 0; i < indexNames.length; i++) {
      const indexName = indexNames[i];
      if (indexName.startsWith('.')) {
        // The index name starts with '.' is not the customized index name.
        continue;
      }

      // Save the index.
      const index = await this.elasticsearchDatasourceIndexService.create({
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
        await this.elasticsearchDatasourceIndexFieldService.createMany({
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
    return await this.elasticsearchDatasourceService.update({
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
    const datasource = await this.elasticsearchDatasourceService.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Delete indices, their fields will be cascade deleted.
    await this.elasticsearchDatasourceIndexService.deleteMany({
      where: {datasourceId: datasource.id},
    });

    // [step 3] Update datasource state.
    return await this.elasticsearchDatasourceService.update({
      where: {id: datasource.id},
      data: {state: ElasticsearchDatasourceState.NOT_LOADED},
    });
  }

  @Get(':datasourceId/indices')
  async getElasticsearchDatasourceIndices(
    @Param('datasourceId') datasourceId: string
  ): Promise<ElasticsearchDatasource> {
    return await this.elasticsearchDatasourceService.findUniqueOrThrow({
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
    const datasource = await this.elasticsearchDatasourceService.findUnique({
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
    const datasource = await this.elasticsearchDatasourceService.findUnique({
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
