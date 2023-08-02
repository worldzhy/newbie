import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityRoom} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityRoomFindUniqueArgs
  ): Promise<AvailabilityRoom | null> {
    return await this.prisma.availabilityRoom.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityRoomFindUniqueOrThrowArgs
  ): Promise<AvailabilityRoom> {
    return await this.prisma.availabilityRoom.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityRoomFindManyArgs
  ): Promise<AvailabilityRoom[]> {
    return await this.prisma.availabilityRoom.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityRoomCreateArgs
  ): Promise<AvailabilityRoom> {
    return await this.prisma.availabilityRoom.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityRoomCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityRoom.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityRoomUpdateArgs
  ): Promise<AvailabilityRoom> {
    return await this.prisma.availabilityRoom.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityRoomUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityRoom.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityRoomDeleteArgs
  ): Promise<AvailabilityRoom> {
    return await this.prisma.availabilityRoom.delete(params);
  }

  /* End */
}
