import {Injectable} from '@nestjs/common';
import {Prisma, SkuConversionItem} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuConversionItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.SkuConversionItemFindUniqueOrThrowArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.SkuConversionItemFindManyArgs
  ): Promise<SkuConversionItem[]> {
    return await this.prisma.skuConversionItem.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.SkuConversionItemFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.SkuConversionItem,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.SkuConversionItemCreateArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.create(args);
  }

  async update(
    args: Prisma.SkuConversionItemUpdateArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.update(args);
  }

  async delete(
    args: Prisma.SkuConversionItemDeleteArgs
  ): Promise<SkuConversionItem> {
    return await this.prisma.skuConversionItem.delete(args);
  }

  /* End */
}
