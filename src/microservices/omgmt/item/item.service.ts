import {Injectable} from '@nestjs/common';
import {Prisma, OrderItem} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.OrderItemFindUniqueArgs
  ): Promise<OrderItem | null> {
    return await this.prisma.orderItem.findUnique(params);
  }

  async findMany(params: Prisma.OrderItemFindManyArgs): Promise<OrderItem[]> {
    return await this.prisma.orderItem.findMany(params);
  }

  async create(params: Prisma.OrderItemCreateArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.create(params);
  }

  async update(params: Prisma.OrderItemUpdateArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.update(params);
  }

  async delete(params: Prisma.OrderItemDeleteArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.delete(params);
  }

  /* End */
}
