import {Injectable} from '@nestjs/common';
import {Prisma, DatatransMission} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class DatatransMissionService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.DatatransMissionFindUniqueArgs
  ): Promise<DatatransMission | null> {
    return await this.prisma.datatransMission.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.DatatransMissionFindUniqueOrThrowArgs
  ): Promise<DatatransMission> {
    return await this.prisma.datatransMission.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.DatatransMissionFindManyArgs
  ): Promise<DatatransMission[]> {
    return await this.prisma.datatransMission.findMany(params);
  }

  async create(
    params: Prisma.DatatransMissionCreateArgs
  ): Promise<DatatransMission> {
    return await this.prisma.datatransMission.create(params);
  }

  async createMany(
    params: Prisma.DatatransMissionCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.datatransMission.createMany(params);
  }

  async update(
    params: Prisma.DatatransMissionUpdateArgs
  ): Promise<DatatransMission> {
    return await this.prisma.datatransMission.update(params);
  }

  async delete(
    params: Prisma.DatatransMissionDeleteArgs
  ): Promise<DatatransMission> {
    return await this.prisma.datatransMission.delete(params);
  }

  /* End */
}
