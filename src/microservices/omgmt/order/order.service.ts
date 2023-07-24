import {Injectable} from '@nestjs/common';
import {Prisma, Order} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.OrderFindUniqueArgs): Promise<Order | null> {
    return await this.prisma.order.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.OrderFindUniqueOrThrowArgs
  ): Promise<Order> {
    return await this.prisma.order.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.OrderFindManyArgs): Promise<Order[]> {
    return await this.prisma.order.findMany(params);
  }

  async create(params: Prisma.OrderCreateArgs): Promise<Order> {
    return await this.prisma.order.create(params);
  }

  async update(params: Prisma.OrderUpdateArgs): Promise<Order> {
    return await this.prisma.order.update(params);
  }

  async delete(params: Prisma.OrderDeleteArgs): Promise<Order> {
    return await this.prisma.order.delete(params);
  }

  creat;
  /* End */
}
