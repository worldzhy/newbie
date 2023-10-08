import {Injectable} from '@nestjs/common';
import {Prisma, EventContainer} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventContainerService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    params: Prisma.EventContainerFindFirstArgs
  ): Promise<EventContainer | null> {
    return await this.prisma.eventContainer.findFirst(params);
  }

  async findUniqueOrThrow(
    params: Prisma.EventContainerFindUniqueOrThrowArgs
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.EventContainerFindManyArgs
  ): Promise<EventContainer[]> {
    return await this.prisma.eventContainer.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.EventContainerFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.EventContainer,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.EventContainerCreateArgs
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.create(params);
  }

  async createMany(
    params: Prisma.EventContainerCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainer.createMany(params);
  }

  async update(
    params: Prisma.EventContainerUpdateArgs
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.update(params);
  }

  async updateMany(
    params: Prisma.EventContainerUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainer.updateMany(params);
  }

  async delete(
    params: Prisma.EventContainerDeleteArgs
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.delete(params);
  }

  async count(params: Prisma.EventContainerCountArgs): Promise<number> {
    return await this.prisma.eventContainer.count(params);
  }

  /* End */
}
