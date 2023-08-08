import {Injectable} from '@nestjs/common';
import {Prisma, Customer} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.CustomerFindUniqueArgs
  ): Promise<Customer | null> {
    return await this.prisma.customer.findUnique(params);
  }

  async findMany(params: Prisma.CustomerFindManyArgs): Promise<Customer[]> {
    return await this.prisma.customer.findMany(params);
  }

  async create(params: Prisma.CustomerCreateArgs): Promise<Customer> {
    return await this.prisma.customer.create(params);
  }

  async update(params: Prisma.CustomerUpdateArgs): Promise<Customer> {
    return await this.prisma.customer.update(params);
  }

  async delete(params: Prisma.CustomerDeleteArgs): Promise<Customer> {
    return await this.prisma.customer.delete(params);
  }

  /* End */
}
