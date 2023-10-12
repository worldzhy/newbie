import {Injectable} from '@nestjs/common';
import {Prisma, SkuTrail} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.SkuTrailFindUniqueOrThrowArgs
  ): Promise<SkuTrail> {
    return await this.prisma.skuTrail.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.SkuTrailFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.SkuTrail,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.SkuTrailCreateArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.create(args);
  }

  async update(args: Prisma.SkuTrailUpdateArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.update(args);
  }

  async delete(args: Prisma.SkuTrailDeleteArgs): Promise<SkuTrail> {
    return await this.prisma.skuTrail.delete(args);
  }

  /* End */
}
