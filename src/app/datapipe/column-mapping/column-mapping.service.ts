import {Injectable} from '@nestjs/common';
import {Prisma, DatapipeColumnMapping} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DatapipeColumnMappingService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a datapipeColumnMapping
   * @param {Prisma.DatapipeColumnMappingWhereUniqueInput} where
   * @returns {(Promise<DatapipeColumnMapping | null>)}
   * @memberof DatapipeColumnMappingService
   */
  async findOne(
    where: Prisma.DatapipeColumnMappingWhereUniqueInput
  ): Promise<DatapipeColumnMapping | null> {
    return await this.prisma.datapipeColumnMapping.findUnique({
      where,
    });
  }

  /**
   * Get many datapipeColumnMappings
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatapipeColumnMappingWhereInput;
   *     orderBy?: Prisma.DatapipeColumnMappingOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatapipeColumnMappingSelect;
   *   }} params
   * @returns
   * @memberof DatapipeColumnMappingService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatapipeColumnMappingWhereInput;
    orderBy?: Prisma.DatapipeColumnMappingOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatapipeColumnMappingSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datapipeColumnMapping.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a datapipeColumnMapping
   *
   * @param {Prisma.DatapipeColumnMappingCreateInput} data
   * @returns {Promise<DatapipeColumnMapping>}
   * @memberof DatapipeColumnMappingService
   */
  async create(
    data: Prisma.DatapipeColumnMappingCreateInput
  ): Promise<DatapipeColumnMapping> {
    return await this.prisma.datapipeColumnMapping.create({
      data,
    });
  }

  /**
   * Update a datapipeColumnMapping
   *
   * @param {{
   *     where: Prisma.DatapipeColumnMappingWhereUniqueInput;
   *     data: Prisma.DatapipeColumnMappingUpdateInput;
   *   }} params
   * @returns {Promise<DatapipeColumnMapping>}
   * @memberof DatapipeColumnMappingService
   */
  async update(params: {
    where: Prisma.DatapipeColumnMappingWhereUniqueInput;
    data: Prisma.DatapipeColumnMappingUpdateInput;
  }): Promise<DatapipeColumnMapping> {
    const {where, data} = params;
    return await this.prisma.datapipeColumnMapping.update({
      data,
      where,
    });
  }

  /**
   * Delete a datapipeColumnMapping
   *
   * @param {Prisma.DatapipeColumnMappingWhereUniqueInput} where
   * @returns {Promise<DatapipeColumnMapping>}
   * @memberof DatapipeColumnMappingService
   */
  async delete(
    where: Prisma.DatapipeColumnMappingWhereUniqueInput
  ): Promise<DatapipeColumnMapping> {
    return await this.prisma.datapipeColumnMapping.delete({
      where,
    });
  }

  /* End */
}
