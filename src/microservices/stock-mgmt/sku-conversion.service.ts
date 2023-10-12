import {Injectable} from '@nestjs/common';
import {Prisma, SkuConversion} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuConversionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.SkuConversionFindUniqueOrThrowArgs
  ): Promise<SkuConversion> {
    return await this.prisma.skuConversion.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.SkuConversionFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.SkuConversion,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.SkuConversionCreateArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.create(args);
  }

  async update(args: Prisma.SkuConversionUpdateArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.update(args);
  }

  async delete(args: Prisma.SkuConversionDeleteArgs): Promise<SkuConversion> {
    return await this.prisma.skuConversion.delete(args);
  }

  /* End */
}
