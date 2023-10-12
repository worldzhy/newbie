import {Injectable} from '@nestjs/common';
import {Prisma, Event} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.EventFindUniqueOrThrowArgs
  ): Promise<Event> {
    return await this.prisma.event.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Event,
      pagination,
      findManyArgs,
    });
  }
  async create(args: Prisma.EventCreateArgs): Promise<Event> {
    return await this.prisma.event.create(args);
  }

  async createMany(
    args: Prisma.EventCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.createMany(args);
  }

  async update(args: Prisma.EventUpdateArgs): Promise<Event> {
    return await this.prisma.event.update(args);
  }

  async updateMany(
    args: Prisma.EventUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.updateMany(args);
  }

  async delete(args: Prisma.EventDeleteArgs): Promise<Event> {
    return await this.prisma.event.delete(args);
  }

  /* End */
}
