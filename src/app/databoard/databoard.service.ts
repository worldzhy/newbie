import {Injectable} from '@nestjs/common';
import {Prisma, Databoard} from '@prisma/client';
import {PrismaService} from '../../_prisma/_prisma.service';

@Injectable()
export class DataboardService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a databoard
   * @param {Prisma.DataboardWhereUniqueInput} where
   * @returns {(Promise<Databoard | null>)}
   * @memberof DataboardService
   */
  async findOne(
    where: Prisma.DataboardWhereUniqueInput
  ): Promise<Databoard | null> {
    return await this.prisma.databoard.findUnique({
      where,
    });
  }

  /**
   * Get many databoards
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DataboardWhereInput;
   *     orderBy?: Prisma.DataboardOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DataboardSelect;
   *   }} params
   * @returns
   * @memberof DataboardService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DataboardWhereInput;
    orderBy?: Prisma.DataboardOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DataboardSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.databoard.findMany({
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
   * @memberof DataboardService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.databoard.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a databoard
   *
   * @param {Prisma.DataboardCreateInput} data
   * @returns {Promise<Databoard>}
   * @memberof DataboardService
   */
  async create(data: Prisma.DataboardCreateInput): Promise<Databoard> {
    return await this.prisma.databoard.create({
      data,
    });
  }

  /**
   * Update a databoard
   *
   * @param {{
   *     where: Prisma.DataboardWhereUniqueInput;
   *     data: Prisma.DataboardUpdateInput;
   *   }} params
   * @returns {Promise<Databoard>}
   * @memberof DataboardService
   */
  async update(params: {
    where: Prisma.DataboardWhereUniqueInput;
    data: Prisma.DataboardUpdateInput;
  }): Promise<Databoard> {
    const {where, data} = params;
    return await this.prisma.databoard.update({
      data,
      where,
    });
  }

  /**
   * Delete a databoard
   *
   * @param {Prisma.DataboardWhereUniqueInput} where
   * @returns {Promise<Databoard>}
   * @memberof DataboardService
   */
  async delete(where: Prisma.DataboardWhereUniqueInput): Promise<Databoard> {
    return await this.prisma.databoard.delete({
      where,
    });
  }

  /* End */
}
