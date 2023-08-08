import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboard} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ElasticsearchDataboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.ElasticsearchDataboardFindUniqueArgs
  ): Promise<ElasticsearchDataboard | null> {
    return await this.prisma.elasticsearchDataboard.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.ElasticsearchDataboardFindUniqueOrThrowArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.ElasticsearchDataboardFindManyArgs
  ): Promise<ElasticsearchDataboard[]> {
    return await this.prisma.elasticsearchDataboard.findMany(params);
  }

  async create(
    params: Prisma.ElasticsearchDataboardCreateArgs
  ): Promise<ElasticsearchDataboard> {
    return await this.prisma.elasticsearchDataboard.create(params);
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

  async checkExistence(id: string) {
    const count = await this.prisma.elasticsearchDataboard.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
