import {Injectable} from '@nestjs/common';
import {Prisma, WarehouseSku} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class WarehouseSkuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WarehouseSkuFindUniqueOrThrowArgs
  ): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.WarehouseSkuFindManyArgs
  ): Promise<WarehouseSku[]> {
    return await this.prisma.warehouseSku.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WarehouseSkuFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.WarehouseSku,
      params,
      pagination
    );
  }

  async create(params: Prisma.WarehouseSkuCreateArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.create(params);
  }

  async update(params: Prisma.WarehouseSkuUpdateArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.update(params);
  }

  async delete(params: Prisma.WarehouseSkuDeleteArgs): Promise<WarehouseSku> {
    return await this.prisma.warehouseSku.delete(params);
  }

  /* End */
}
