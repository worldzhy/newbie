import {Injectable} from '@nestjs/common';
import {Prisma, Address} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class AddressService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.AddressFindUniqueArgs
  ): Promise<Address | null> {
    return await this.prisma.address.findUnique(params);
  }

  async findMany(params: Prisma.AddressFindManyArgs): Promise<Address[]> {
    return await this.prisma.address.findMany(params);
  }

  async create(params: Prisma.AddressCreateArgs): Promise<Address> {
    return await this.prisma.address.create(params);
  }

  async update(params: Prisma.AddressUpdateArgs): Promise<Address> {
    return await this.prisma.address.update(params);
  }

  async delete(params: Prisma.AddressDeleteArgs): Promise<Address> {
    return await this.prisma.address.delete(params);
  }

  /* End */
}
