import {Injectable} from '@nestjs/common';
import {Prisma, Sku} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(args: Prisma.SkuFindUniqueOrThrowArgs): Promise<Sku> {
    return await this.prisma.sku.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.SkuFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Sku,
      pagination,
      findManyArgs,
    });
  }
  async create(args: Prisma.SkuCreateArgs): Promise<Sku> {
    return await this.prisma.sku.create(args);
  }

  async update(args: Prisma.SkuUpdateArgs): Promise<Sku> {
    return await this.prisma.sku.update(args);
  }

  async delete(args: Prisma.SkuDeleteArgs): Promise<Sku> {
    return await this.prisma.sku.delete(args);
  }

  creat;
  /* End */
}
