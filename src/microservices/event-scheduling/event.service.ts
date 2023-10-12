import {Injectable} from '@nestjs/common';
import {Prisma, Event} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.EventFindUniqueOrThrowArgs
  ): Promise<Event> {
    return await this.prisma.event.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.EventFindManyArgs): Promise<Event[]> {
    return await this.prisma.event.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.EventFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Event,
      params,
      pagination
    );
  }

  async create(params: Prisma.EventCreateArgs): Promise<Event> {
    return await this.prisma.event.create(params);
  }

  async createMany(
    params: Prisma.EventCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.createMany(params);
  }

  async update(params: Prisma.EventUpdateArgs): Promise<Event> {
    return await this.prisma.event.update(params);
  }

  async updateMany(
    params: Prisma.EventUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.updateMany(params);
  }

  async delete(params: Prisma.EventDeleteArgs): Promise<Event> {
    return await this.prisma.event.delete(params);
  }

  /* End */
}
