import {Injectable} from '@nestjs/common';
import {Prisma, ElasticsearchDataboardColumn} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ElasticsearchDataboardColumnService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ElasticsearchDataboardColumnFindUniqueArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.findUniqueOrThrow(
      args
    );
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ElasticsearchDataboardColumnFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ElasticsearchDataboardColumn,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.ElasticsearchDataboardColumnCreateArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.create(args);
  }

  async createMany(
    args: Prisma.ElasticsearchDataboardColumnCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDataboardColumn.createMany(args);
  }

  async update(
    args: Prisma.ElasticsearchDataboardColumnUpdateArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.update(args);
  }

  async delete(
    args: Prisma.ElasticsearchDataboardColumnDeleteArgs
  ): Promise<ElasticsearchDataboardColumn> {
    return await this.prisma.elasticsearchDataboardColumn.delete(args);
  }

  async deleteMany(
    args: Prisma.ElasticsearchDataboardColumnDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDataboardColumn.deleteMany(args);
  }

  /* End */
}
