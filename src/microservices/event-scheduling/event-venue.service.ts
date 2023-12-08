import {Injectable} from '@nestjs/common';
import {Prisma, EventVenue} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventVenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    args: Prisma.EventVenueFindFirstArgs
  ): Promise<EventVenue | null> {
    return await this.prisma.eventVenue.findFirst(args);
  }

  async findUniqueOrThrow(
    args: Prisma.EventVenueFindUniqueOrThrowArgs
  ): Promise<EventVenue> {
    return await this.prisma.eventVenue.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.EventVenueFindManyArgs): Promise<EventVenue[]> {
    return await this.prisma.eventVenue.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventVenueFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventVenue,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventVenueCreateArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.create(args);
  }

  async createMany(
    args: Prisma.EventVenueCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventVenue.createMany(args);
  }

  async update(args: Prisma.EventVenueUpdateArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.update(args);
  }

  async updateMany(
    args: Prisma.EventVenueUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventVenue.updateMany(args);
  }

  async delete(args: Prisma.EventVenueDeleteArgs): Promise<EventVenue> {
    return await this.prisma.eventVenue.delete(args);
  }

  async count(args: Prisma.EventVenueCountArgs): Promise<number> {
    return await this.prisma.eventVenue.count(args);
  }

  /* End */
}
