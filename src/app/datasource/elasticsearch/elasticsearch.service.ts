import {Injectable, NotFoundException} from '@nestjs/common';
import {DatasourceElasticsearch, Prisma} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DatasourceElasticsearchService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a datasourceElasticsearch
   * @param {Prisma.DatasourceElasticsearchWhereUniqueInput} where
   * @returns {(Promise<DatasourceElasticsearch | null>)}
   * @memberof DatasourceElasticsearchService
   */
  async findOne(
    where: Prisma.DatasourceElasticsearchWhereUniqueInput
  ): Promise<DatasourceElasticsearch | null> {
    return await this.prisma.datasourceElasticsearch.findUnique({where});
  }

  /**
   * Get many datasourceElasticsearchs
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatasourceElasticsearchWhereInput;
   *     orderBy?: Prisma.DatasourceElasticsearchOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatasourceElasticsearchSelect;
   *   }} params
   * @returns
   * @memberof DatasourceElasticsearchService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatasourceElasticsearchWhereInput;
    orderBy?: Prisma.DatasourceElasticsearchOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatasourceElasticsearchSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datasourceElasticsearch.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a datasourceElasticsearch
   *
   * @param {Prisma.DatasourceElasticsearchCreateInput} data
   * @returns {Promise<DatasourceElasticsearch>}
   * @memberof DatasourceElasticsearchService
   */
  async create(
    data: Prisma.DatasourceElasticsearchCreateInput
  ): Promise<DatasourceElasticsearch> {
    return await this.prisma.datasourceElasticsearch.create({
      data,
    });
  }

  /**
   * Update a datasourceElasticsearch
   *
   * @param {{
   *     where: Prisma.DatasourceElasticsearchWhereUniqueInput;
   *     data: Prisma.DatasourceElasticsearchUpdateInput;
   *   }} params
   * @returns {Promise<DatasourceElasticsearch>}
   * @memberof DatasourceElasticsearchService
   */
  async update(params: {
    where: Prisma.DatasourceElasticsearchWhereUniqueInput;
    data: Prisma.DatasourceElasticsearchUpdateInput;
  }): Promise<DatasourceElasticsearch> {
    const {where, data} = params;
    return await this.prisma.datasourceElasticsearch.update({
      data,
      where,
    });
  }

  /**
   * Delete a datasourceElasticsearch
   *
   * @param {Prisma.DatasourceElasticsearchWhereUniqueInput} where
   * @returns {Promise<DatasourceElasticsearch>}
   * @memberof DatasourceElasticsearchService
   */
  async delete(
    where: Prisma.DatasourceElasticsearchWhereUniqueInput
  ): Promise<DatasourceElasticsearch> {
    return await this.prisma.datasourceElasticsearch.delete({
      where,
    });
  }

  /* End */
}
