import {Injectable} from '@nestjs/common';
import {Prisma, EventLocation} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventLocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.EventLocationFindUniqueArgs): Promise<EventLocation | null> {
    return await this.prisma.eventLocation.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.EventLocationFindUniqueOrThrowArgs
  ): Promise<EventLocation> {
    return await this.prisma.eventLocation.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.EventLocationFindManyArgs): Promise<EventLocation[]> {
    return await this.prisma.eventLocation.findMany(params);
  }

  async create(params: Prisma.EventLocationCreateArgs): Promise<EventLocation> {
    return await this.prisma.eventLocation.create(params);
  }

  async createMany(
    params: Prisma.EventLocationCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventLocation.createMany(params);
  }

  async findManyWithTotal(
    params: Prisma.EventLocationFindManyArgs
  ): Promise<[EventLocation[], number]> {
    return await this.prisma.$transaction([
      this.prisma.eventLocation.findMany(params),
      this.prisma.eventLocation.count({where: params.where}),
    ]);
  }

  async update(params: Prisma.EventLocationUpdateArgs): Promise<EventLocation> {
    return await this.prisma.eventLocation.update(params);
  }

  async updateMany(
    params: Prisma.EventLocationUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventLocation.updateMany(params);
  }

  async delete(params: Prisma.EventLocationDeleteArgs): Promise<EventLocation> {
    return await this.prisma.eventLocation.delete(params);
  }

  /* End */
}
