import {Injectable} from '@nestjs/common';
import {Prisma, Order} from '@prisma/client';
import {PrismaService} from '../../toolkits/prisma/prisma.service';

@Injectable()
export class OrderService {
  private prisma = new PrismaService();

  async findUnique(params: Prisma.OrderFindUniqueArgs): Promise<Order | null> {
    return await this.prisma.order.findUnique(params);
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

  /* End */
}
