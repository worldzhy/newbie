import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboard} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDataboardService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ElasticsearchDataboardFindUniqueArgs
  ): Promise<ElasticsearchDataboard | null> {
    return await this.prisma.elasticsearchDataboard.findUnique(params);
  }

  async findMany(
    params: Prisma.ElasticsearchDataboardFindManyArgs
  ): Promise<ElasticsearchDataboard[]> {
    return await this.prisma.elasticsearchDataboard.findMany(params);
  }

  async create(
    data: Prisma.ElasticsearchDataboardCreateInput
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.create({
      data,
    });
  }

  async update(
    params: Prisma.ElasticsearchDataboardUpdateArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.update(params);
  }

  async delete(
    params: Prisma.ElasticsearchDataboardDeleteArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.delete(params);
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

  /* End */
}
