import {Injectable} from '@nestjs/common';
import {Prisma, Sku} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.SkuFindUniqueArgs): Promise<Sku | null> {
    return await this.prisma.sku.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.SkuFindUniqueOrThrowArgs
  ): Promise<Sku> {
    return await this.prisma.sku.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.SkuFindManyArgs): Promise<Sku[]> {
    return await this.prisma.sku.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.SkuFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Sku,
      params,
      pagination
    );
  }

  async create(params: Prisma.SkuCreateArgs): Promise<Sku> {
    return await this.prisma.sku.create(params);
  }

  async update(params: Prisma.SkuUpdateArgs): Promise<Sku> {
    return await this.prisma.sku.update(params);
  }

  async delete(params: Prisma.SkuDeleteArgs): Promise<Sku> {
    return await this.prisma.sku.delete(params);
  }

  creat;
  /* End */
}
