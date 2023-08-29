import {Injectable} from '@nestjs/common';
import {Prisma, Space} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.SpaceFindUniqueArgs): Promise<Space | null> {
    return await this.prisma.space.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.SpaceFindUniqueOrThrowArgs
  ): Promise<Space> {
    return await this.prisma.space.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.SpaceFindManyArgs): Promise<Space[]> {
    return await this.prisma.space.findMany(params);
  }

  async create(params: Prisma.SpaceCreateArgs): Promise<Space> {
    return await this.prisma.space.create(params);
  }

  async createMany(
    params: Prisma.SpaceCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.space.createMany(params);
  }

  async update(params: Prisma.SpaceUpdateArgs): Promise<Space> {
    return await this.prisma.space.update(params);
  }

  async updateMany(
    params: Prisma.SpaceUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.space.updateMany(params);
  }

  async delete(params: Prisma.SpaceDeleteArgs): Promise<Space> {
    return await this.prisma.space.delete(params);
  }

  /* End */
}
