import {Injectable} from '@nestjs/common';
import {Prisma, EventType} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.EventTypeFindUniqueOrThrowArgs
  ): Promise<EventType> {
    return await this.prisma.eventType.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.EventTypeFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.EventType,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventTypeFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventType,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventTypeCreateArgs): Promise<EventType> {
    return await this.prisma.eventType.create(args);
  }

  async createMany(
    args: Prisma.EventTypeCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventType.createMany(args);
  }

  async update(args: Prisma.EventTypeUpdateArgs): Promise<EventType> {
    return await this.prisma.eventType.update(args);
  }

  async updateMany(
    args: Prisma.EventTypeUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventType.updateMany(args);
  }

  async delete(args: Prisma.EventTypeDeleteArgs): Promise<EventType> {
    return await this.prisma.eventType.delete(args);
  }

  /* End */
}
