import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityTimeslot} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityTimeslotService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityTimeslotFindUniqueArgs
  ): Promise<AvailabilityTimeslot | null> {
    return await this.prisma.availabilityTimeslot.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityTimeslotFindUniqueOrThrowArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityTimeslotFindManyArgs
  ): Promise<AvailabilityTimeslot[]> {
    return await this.prisma.availabilityTimeslot.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityTimeslotCreateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityTimeslotCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityTimeslotUpdateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityTimeslotUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityTimeslotDeleteArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.delete(params);
  }

  async deleteMany(
    params: Prisma.AvailabilityTimeslotDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.deleteMany(params);
  }

  /* End */
}
