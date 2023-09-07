import {Injectable} from '@nestjs/common';
import {Prisma, EventVenue} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventVenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.EventVenueFindUniqueArgs
  ): Promise<EventVenue | null> {
    return await this.prisma.eventVenue.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.EventVenueFindUniqueOrThrowArgs
  ): Promise<EventVenue> {
    return await this.prisma.eventVenue.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.EventVenueFindManyArgs): Promise<EventVenue[]> {
    return await this.prisma.eventVenue.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.EventVenueFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.EventVenue,
      params,
      pagination
    );
  }

  async create(params: Prisma.EventVenueCreateArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.create(params);
  }

  async createMany(
    params: Prisma.EventVenueCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventVenue.createMany(params);
  }

  async update(params: Prisma.EventVenueUpdateArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.update(params);
  }

  async updateMany(
    params: Prisma.EventVenueUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventVenue.updateMany(params);
  }

  async delete(params: Prisma.EventVenueDeleteArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.delete(params);
  }

  /* End */
}
