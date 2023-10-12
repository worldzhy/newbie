import {Injectable} from '@nestjs/common';
import {Prisma, EventContainer} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventContainerService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    args: Prisma.EventContainerFindFirstArgs
  ): Promise<EventContainer | null> {
    return await this.prisma.eventContainer.findFirst(args);
  }

  async findUniqueOrThrow(
    args: Prisma.EventContainerFindUniqueOrThrowArgs
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventContainerFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventContainer,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventContainerCreateArgs): Promise<EventContainer> {
    return await this.prisma.eventContainer.create(args);
  }

  async createMany(
    args: Prisma.EventContainerCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainer.createMany(args);
  }

  async update(args: Prisma.EventContainerUpdateArgs): Promise<EventContainer> {
    return await this.prisma.eventContainer.update(args);
  }

  async updateMany(
    args: Prisma.EventContainerUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainer.updateMany(args);
  }

  async delete(args: Prisma.EventContainerDeleteArgs): Promise<EventContainer> {
    return await this.prisma.eventContainer.delete(args);
  }

  async count(args: Prisma.EventContainerCountArgs): Promise<number> {
    return await this.prisma.eventContainer.count(args);
  }

  /* End */
}
