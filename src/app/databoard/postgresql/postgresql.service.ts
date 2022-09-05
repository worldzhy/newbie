import {Injectable} from '@nestjs/common';
import {Prisma, Databoard} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DataboardPostgresqlService {
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

  /* End */
}
