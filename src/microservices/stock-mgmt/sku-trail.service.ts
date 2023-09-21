import {Injectable} from '@nestjs/common';
import {Prisma, SkuTrail} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.SkuTrailFindUniqueOrThrowArgs
  ): Promise<SkuTrail> {
    return await this.prisma.skuTrail.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.SkuTrailFindManyArgs): Promise<SkuTrail[]> {
    return await this.prisma.skuTrail.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.SkuTrailFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.SkuTrail,
      params,
      pagination
    );
  }

  async create(params: Prisma.SkuTrailCreateArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.create(params);
  }

  async update(params: Prisma.SkuTrailUpdateArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.update(params);
  }

  async delete(params: Prisma.SkuTrailDeleteArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.delete(params);
  }

  /* End */
}
