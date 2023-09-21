import {Injectable} from '@nestjs/common';
import {Prisma, SkuConversionItem} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuConversionItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.SkuConversionItemFindUniqueOrThrowArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.SkuConversionItemFindManyArgs
  ): Promise<SkuConversionItem[]> {
    return await this.prisma.skuConversionItem.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.SkuConversionItemFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.SkuConversionItem,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.SkuConversionItemCreateArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.create(params);
  }

  async update(
    params: Prisma.SkuConversionItemUpdateArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.update(params);
  }

  async delete(
    params: Prisma.SkuConversionItemDeleteArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.delete(params);
  }

  /* End */
}
