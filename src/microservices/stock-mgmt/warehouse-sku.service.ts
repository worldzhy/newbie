import {Injectable} from '@nestjs/common';
import {Prisma, WarehouseSku} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class WarehouseSkuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WarehouseSkuFindUniqueOrThrowArgs
  ): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WarehouseSkuFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.WarehouseSku,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WarehouseSkuCreateArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.create(args);
  }

  async update(args: Prisma.WarehouseSkuUpdateArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.update(args);
  }

  async delete(args: Prisma.WarehouseSkuDeleteArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.delete(args);
  }

  /* End */
}
