import {Injectable} from '@nestjs/common';
import {Prisma, Warehouse} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WarehouseFindUniqueOrThrowArgs
  ): Promise<Warehouse> {
    return await this.prisma.warehouse.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.WarehouseFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Warehouse,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WarehouseFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Warehouse,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WarehouseCreateArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.create(args);
  }

  async update(args: Prisma.WarehouseUpdateArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.update(args);
  }

  async delete(args: Prisma.WarehouseDeleteArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.delete(args);
  }

  /* End */
}
