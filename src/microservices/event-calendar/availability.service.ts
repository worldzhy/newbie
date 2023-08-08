import {Injectable} from '@nestjs/common';
import {Prisma, Availability} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityFindUniqueArgs
  ): Promise<Availability | null> {
    return await this.prisma.availability.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityFindUniqueOrThrowArgs
  ): Promise<Availability> {
    return await this.prisma.availability.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityFindManyArgs
  ): Promise<Availability[]> {
    return await this.prisma.availability.findMany(params);
  }

  async create(params: Prisma.AvailabilityCreateArgs): Promise<Availability> {
    return await this.prisma.availability.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availability.createMany(params);
  }

  async update(params: Prisma.AvailabilityUpdateArgs): Promise<Availability> {
    return await this.prisma.availability.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availability.updateMany(params);
  }

  async delete(params: Prisma.AvailabilityDeleteArgs): Promise<Availability> {
    return await this.prisma.availability.delete(params);
  }

  /* End */
}
