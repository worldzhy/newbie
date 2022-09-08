import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboard} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDataboardService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get an elasticsearch databoard
   * @param {Prisma.ElasticsearchDataboardWhereUniqueInput} where
   * @returns {(Promise<ElasticsearchDataboard | null>)}
   * @memberof ElasticsearchDataboardService
   */
  async findOne(
    where: Prisma.ElasticsearchDataboardWhereUniqueInput
  ): Promise<ElasticsearchDataboard | null> {
    return await this.prisma.elasticsearchDataboard.findUnique({
      where,
    });
  }

  /**
   * Get many databoards
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.ElasticsearchDataboardWhereInput;
   *     orderBy?: Prisma.ElasticsearchDataboardOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.ElasticsearchDataboardSelect;
   *   }} params
   * @returns
   * @memberof ElasticsearchDataboardService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ElasticsearchDataboardWhereInput;
    orderBy?: Prisma.ElasticsearchDataboardOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.ElasticsearchDataboardSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.elasticsearchDataboard.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof ElasticsearchDataboardService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.elasticsearchDataboard.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create an elasticsearch databoard
   *
   * @param {Prisma.ElasticsearchDataboardCreateInput} data
   * @returns {Promise<ElasticsearchDataboard>}
   * @memberof ElasticsearchDataboardService
   */
  async create(
    data: Prisma.ElasticsearchDataboardCreateInput
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.create({
      data,
    });
  }

  /**
   * Update an elasticsearch databoard
   *
   * @param {{
   *     where: Prisma.ElasticsearchDataboardWhereUniqueInput;
   *     data: Prisma.ElasticsearchDataboardUpdateInput;
   *   }} params
   * @returns {Promise<ElasticsearchDataboard>}
   * @memberof ElasticsearchDataboardService
   */
  async update(params: {
    where: Prisma.ElasticsearchDataboardWhereUniqueInput;
    data: Prisma.ElasticsearchDataboardUpdateInput;
  }): Promise<ElasticsearchDataboard> {
    const {where, data} = params;
    return await this.prisma.elasticsearchDataboard.update({
      data,
      where,
    });
  }

  /**
   * Delete an elasticsearch databoard
   *
   * @param {Prisma.ElasticsearchDataboardWhereUniqueInput} where
   * @returns {Promise<ElasticsearchDataboard>}
   * @memberof ElasticsearchDataboardService
   */
  async delete(
    where: Prisma.ElasticsearchDataboardWhereUniqueInput
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.delete({
      where,
    });
  }

  /* End */
}
