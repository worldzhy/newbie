import {Injectable} from '@nestjs/common';
import {Prisma, Warehouse} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WarehouseFindUniqueOrThrowArgs
  ): Promise<Warehouse> {
    return await this.prisma.warehouse.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WarehouseFindManyArgs): Promise<Warehouse[]> {
    return await this.prisma.warehouse.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WarehouseFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Warehouse,
      params,
      pagination
    );
  }

  async create(params: Prisma.WarehouseCreateArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.create(params);
  }

  async update(params: Prisma.WarehouseUpdateArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.update(params);
  }

  async delete(params: Prisma.WarehouseDeleteArgs): Promise<Warehouse> {
    return await this.prisma.warehouse.delete(params);
  }

  /* End */
}
