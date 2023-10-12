import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboard} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ElasticsearchDataboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ElasticsearchDataboardFindUniqueOrThrowArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ElasticsearchDataboardFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ElasticsearchDataboard,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.ElasticsearchDataboardCreateArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.create(args);
  }

  async update(
    args: Prisma.ElasticsearchDataboardUpdateArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.update(args);
  }

  async delete(
    args: Prisma.ElasticsearchDataboardDeleteArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.delete(args);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.elasticsearchDataboard.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
