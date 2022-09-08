import {Injectable} from '@nestjs/common';
import {Prisma, Datapipe} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DatapipeService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a datapipe
   * @param {Prisma.DatapipeWhereUniqueInput} where
   * @returns {(Promise<Datapipe | null>)}
   * @memberof DatapipeService
   */
  async findOne(
    where: Prisma.DatapipeWhereUniqueInput
  ): Promise<Datapipe | null> {
    return await this.prisma.datapipe.findUnique({
      where,
    });
  }

  /**
   * Get many datapipes
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatapipeWhereInput;
   *     orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatapipeSelect;
   *   }} params
   * @returns
   * @memberof DatapipeService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatapipeWhereInput;
    orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatapipeSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datapipe.findMany({
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
   * @memberof DatapipeService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.datapipe.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a datapipe
   *
   * @param {Prisma.DatapipeCreateInput} data
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async create(data: Prisma.DatapipeCreateInput): Promise<Datapipe> {
    return await this.prisma.datapipe.create({
      data,
    });
  }

  /**
   * Update a datapipe
   *
   * @param {{
   *     where: Prisma.DatapipeWhereUniqueInput;
   *     data: Prisma.DatapipeUpdateInput;
   *   }} params
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async update(params: {
    where: Prisma.DatapipeWhereUniqueInput;
    data: Prisma.DatapipeUpdateInput;
  }): Promise<Datapipe> {
    const {where, data} = params;
    return await this.prisma.datapipe.update({
      data,
      where,
    });
  }

  /**
   * Delete a datapipe
   *
   * @param {Prisma.DatapipeWhereUniqueInput} where
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async delete(where: Prisma.DatapipeWhereUniqueInput): Promise<Datapipe> {
    return await this.prisma.datapipe.delete({
      where,
    });
  }

  /* End */
}
