import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityPeriod} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityPeriodService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityPeriodFindUniqueArgs
  ): Promise<AvailabilityPeriod | null> {
    return await this.prisma.availabilityPeriod.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityPeriodFindUniqueOrThrowArgs
  ): Promise<AvailabilityPeriod> {
    return await this.prisma.availabilityPeriod.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityPeriodFindManyArgs
  ): Promise<AvailabilityPeriod[]> {
    return await this.prisma.availabilityPeriod.findMany(params);
  }

  async create(params: Prisma.AvailabilityPeriodCreateArgs): Promise<AvailabilityPeriod> {
    return await this.prisma.availabilityPeriod.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityPeriodCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityPeriod.createMany(params);
  }

  async update(params: Prisma.AvailabilityPeriodUpdateArgs): Promise<AvailabilityPeriod> {
    return await this.prisma.availabilityPeriod.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityPeriodUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityPeriod.updateMany(params);
  }

  async delete(params: Prisma.AvailabilityPeriodDeleteArgs): Promise<AvailabilityPeriod> {
    return await this.prisma.availabilityPeriod.delete(params);
  }

  /* End */
}
