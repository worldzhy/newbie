import {Injectable} from '@nestjs/common';
import {Prisma, OrderItem} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.OrderItemFindUniqueOrThrowArgs
  ): Promise<OrderItem> {
    return await this.prisma.orderItem.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.OrderItemFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.OrderItem,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.OrderItemCreateArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.create(args);
  }

  async update(args: Prisma.OrderItemUpdateArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.update(args);
  }

  async delete(args: Prisma.OrderItemDeleteArgs): Promise<OrderItem> {
    return await this.prisma.orderItem.delete(args);
  }

  /* End */
}
