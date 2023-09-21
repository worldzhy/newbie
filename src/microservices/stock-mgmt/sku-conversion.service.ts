import {Injectable} from '@nestjs/common';
import {Prisma, SkuConversion} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuConversionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.SkuConversionFindUniqueArgs
  ): Promise<SkuConversion | null> {
    return await this.prisma.skuConversion.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.SkuConversionFindUniqueOrThrowArgs
  ): Promise<SkuConversion> {
    return await this.prisma.skuConversion.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.SkuConversionFindManyArgs
  ): Promise<SkuConversion[]> {
    return await this.prisma.skuConversion.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.SkuConversionFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.SkuConversion,
      params,
      pagination
    );
  }

  async create(params: Prisma.SkuConversionCreateArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.create(params);
  }

  async update(params: Prisma.SkuConversionUpdateArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.update(params);
  }

  async delete(params: Prisma.SkuConversionDeleteArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.delete(params);
  }

  /* End */
}
