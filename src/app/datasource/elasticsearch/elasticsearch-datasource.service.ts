import {RequestParams} from '@elastic/elasticsearch';
import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasource, Prisma} from '@prisma/client';
import {ElasticsearchService} from '../../../_elasticsearch/_elasticsearch.service';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {get as lodash_get, split as lodash_split} from 'lodash';
import {ElasticsearchDatasourceIndexService} from './index/index.service';
import {ElasticsearchDatasourceIndexFieldService} from './field/field.service';

@Injectable()
export class ElasticsearchDatasourceService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();
  private elasticsearchDatasourceIndexFieldService =
    new ElasticsearchDatasourceIndexFieldService();

  /**
   * Extract elasticsearch datasource indices and their fields.
   * @param datasource
   * @returns
   */
  async mount(datasource: ElasticsearchDatasource) {
    // [step 1] Get mappings of all indices.
    const result = await this.elasticsearch.indices.getMapping();
    if (result.statusCode !== 200) {
      return;
    }

    // [step 2] Save fields of all indices.
    const indexNames = Object.keys(result.body);
    for (let i = 0; i < indexNames.length; i++) {
      const indexName = indexNames[i];
      if (indexName.startsWith('.')) {
        // The index name starts with '.' is not the customized index name.
        continue;
      }

      // Save the index.
      const index = await this.elasticsearchDatasourceIndexService.create({
        name: indexName,
        datasource: {connect: {id: datasource.id}},
      });

      // Save fields of the index.
      const fieldNames = Object.keys(
        result.body[indexName].mappings.properties
      );
      await this.elasticsearchDatasourceIndexFieldService.createMany(
        fieldNames.map(fieldName => {
          return {
            field: fieldName,
            fieldBody: result.body[indexName].mappings.properties[fieldName],
            indexId: index.id,
          };
        })
      );
    }
  }

  /**
   * Clear elasticsearch datasource indices and their fields.
   * @param datasource
   * @returns
   */
  async unmount(datasource: ElasticsearchDatasource) {
    // [step 1] Delete indices, their fields will be cascade deleted.
    await this.elasticsearchDatasourceIndexService.deleteMany({
      datasourceId: datasource.id,
    });
  }

  /**
   * Get a elasticsearchDatasource
   * @param {Prisma.ElasticsearchDatasourceWhereUniqueInput} where
   * @returns {(Promise<ElasticsearchDatasource | null>)}
   * @memberof ElasticsearchDatasourceService
   */
  async findOne(
    where: Prisma.ElasticsearchDatasourceWhereUniqueInput
  ): Promise<ElasticsearchDatasource | null> {
    return await this.prisma.elasticsearchDatasource.findUnique({where});
  }

  /**
   * Get many elasticsearchDatasources
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.ElasticsearchDatasourceWhereInput;
   *     orderBy?: Prisma.ElasticsearchDatasourceOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.ElasticsearchDatasourceSelect;
   *   }} params
   * @returns
   * @memberof ElasticsearchDatasourceService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ElasticsearchDatasourceWhereInput;
    orderBy?: Prisma.ElasticsearchDatasourceOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.ElasticsearchDatasourceSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.elasticsearchDatasource.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a elasticsearchDatasource
   *
   * @param {Prisma.ElasticsearchDatasourceCreateInput} data
   * @returns {Promise<ElasticsearchDatasource>}
   * @memberof ElasticsearchDatasourceService
   */
  async create(
    data: Prisma.ElasticsearchDatasourceCreateInput
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.create({
      data,
    });
  }

  /**
   * Update a elasticsearchDatasource
   *
   * @param {{
   *     where: Prisma.ElasticsearchDatasourceWhereUniqueInput;
   *     data: Prisma.ElasticsearchDatasourceUpdateInput;
   *   }} params
   * @returns {Promise<ElasticsearchDatasource>}
   * @memberof ElasticsearchDatasourceService
   */
  async update(params: {
    where: Prisma.ElasticsearchDatasourceWhereUniqueInput;
    data: Prisma.ElasticsearchDatasourceUpdateInput;
  }): Promise<ElasticsearchDatasource> {
    const {where, data} = params;
    return await this.prisma.elasticsearchDatasource.update({
      data,
      where,
    });
  }

  /**
   * Delete a elasticsearchDatasource
   *
   * @param {Prisma.ElasticsearchDatasourceWhereUniqueInput} where
   * @returns {Promise<ElasticsearchDatasource>}
   * @memberof ElasticsearchDatasourceService
   */
  async delete(
    where: Prisma.ElasticsearchDatasourceWhereUniqueInput
  ): Promise<ElasticsearchDatasource> {
    return await this.prisma.elasticsearchDatasource.delete({
      where,
    });
  }

  /**
   * Search
   * @param params
   * @returns
   */
  async search(params: RequestParams.Search) {
    return await this.elasticsearch.search(params);
  }

  /**
   * Search aggregations
   * @param params
   * @returns
   */
  async searchAggregations(params: any) {
    // [step 1] Parse params
    const searchParams = this.parseSearchAggregationsParams(params);

    // [step 2] Search
    const result = await this.elasticsearch.search(searchParams);

    // [step 3] Parse response
    return this.parseSearchAggregationsResult(params, result);
  }

  private parseSearchAggregationsParams(params: any) {
    const {type} = params;
    const index = lodash_get(params, 'searchDto.index');
    const query = lodash_get(params, 'searchDto.body.query');
    const aggregationMode = lodash_get(params, 'aggregationMode');

    let field: any;
    let termsSize: any;
    switch (type) {
      case 'terms':
        field = lodash_get(params, 'option.column[0]');
        termsSize = lodash_get(params, 'option.chartOption.termsSize') || 10;
        return {
          index,
          body: {
            track_total_hits: true,
            query,
            size: 0,
            aggs: {
              terms: {
                terms: {
                  field,
                  size: termsSize,
                },
              },
            },
          },
        };
      case 'nested':
        if (aggregationMode === 'normal') {
          field = lodash_get(params, 'option.column[0]');
          termsSize = lodash_get(params, 'option.chartOption.termsSize') || 10;
          const nestPath = lodash_get(lodash_split(field, '.'), '0');
          return {
            index,
            body: {
              track_total_hits: true,
              query,
              size: 0,
              aggs: {
                terms: {
                  nested: {
                    path: nestPath,
                  },
                  aggs: {
                    terms: {
                      terms: {
                        field,
                      },
                    },
                  },
                },
              },
            },
          };
        }
        if (aggregationMode === 'reverse') {
          field = lodash_get(params, 'option.column[0]');
          termsSize = lodash_get(params, 'option.chartOption.termsSize') || 10;
          const reverseColumns = lodash_get(params, 'reverseColumns');
          const nestPath = lodash_get(lodash_split(field, '.'), '0');
          return {
            index,
            body: {
              track_total_hits: true,
              query,
              size: 0,
              aggs: {
                terms: {
                  nested: {
                    path: nestPath,
                  },
                  aggs: {
                    terms: {
                      terms: {
                        field,
                      },
                      aggs: {
                        terms: {
                          reverse_nested: {},
                          aggs: {
                            terms: {
                              terms: {
                                field: reverseColumns,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          };
        }
      default:
        return params;
    }
  }

  private parseSearchAggregationsResult(params: any, response: any) {
    const {type} = params;
    const {statusCode} = response;

    if (statusCode !== 200) {
      return null;
    }

    const aggregations = lodash_get(response, 'body.aggregations');

    switch (type) {
      case 'terms':
        return {
          sum_other_doc_count: aggregations.terms.sum_other_doc_count,
          list: aggregations.terms.buckets,
        };
      case 'nested':
        return {
          sum_other_doc_count: aggregations.terms.terms.sum_other_doc_count,
          list: aggregations.terms.terms.buckets,
        };
      default:
        return null;
    }
  }

  /* End */
}
