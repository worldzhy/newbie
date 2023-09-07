import {Injectable} from '@nestjs/common';
import {Prisma, EventType} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.EventTypeFindUniqueArgs
  ): Promise<EventType | null> {
    return await this.prisma.eventType.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.EventTypeFindUniqueOrThrowArgs
  ): Promise<EventType> {
    return await this.prisma.eventType.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.EventTypeFindManyArgs): Promise<EventType[]> {
    return await this.prisma.eventType.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.EventTypeFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.EventType,
      params,
      pagination
    );
  }

  async create(params: Prisma.EventTypeCreateArgs): Promise<EventType> {
    return await this.prisma.eventType.create(params);
  }

  async createMany(
    params: Prisma.EventTypeCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventType.createMany(params);
  }

  async update(params: Prisma.EventTypeUpdateArgs): Promise<EventType> {
    return await this.prisma.eventType.update(params);
  }

  async updateMany(
    params: Prisma.EventTypeUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventType.updateMany(params);
  }

  async delete(params: Prisma.EventTypeDeleteArgs): Promise<EventType> {
    return await this.prisma.eventType.delete(params);
  }

  /* End */
}
