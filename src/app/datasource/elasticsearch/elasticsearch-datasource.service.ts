import {RequestParams} from '@elastic/elasticsearch';
import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasource, Prisma} from '@prisma/client';
import {ElasticsearchService} from '../../../_elasticsearch/_elasticsearch.service';
import {PrismaService} from '../../../_prisma/_prisma.service';
import _ from 'lodash';

@Injectable()
export class ElasticsearchDatasourceService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();

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
    return await this.elasticsearch.search(searchParams);
  }

  private parseSearchAggregationsParams(params: any) {
    const {type} = params;
    const index = _.get(params, 'searchDto.index');
    const query = _.get(params, 'searchDto.body.query');
    const aggregationMode = _.get(params, 'aggregationMode');

    let field: any;
    let termsSize: any;
    switch (type) {
      case 'terms':
        field = _.get(params, 'option.column[0]');
        termsSize = _.get(params, 'option.chartOption.termsSize') || 10;
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
          field = _.get(params, 'option.column[0]');
          termsSize = _.get(params, 'option.chartOption.termsSize') || 10;
          const nestPath = _.get(_.split(field, '.'), '0');
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
          field = _.get(params, 'option.column[0]');
          termsSize = _.get(params, 'option.chartOption.termsSize') || 10;
          const reverseColumns = _.get(params, 'reverseColumns');
          const nestPath = _.get(_.split(field, '.'), '0');
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

  /* End */
}
