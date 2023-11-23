import {Injectable} from '@nestjs/common';
import {Prisma, EventChangeLog} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventChangeLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    args: Prisma.EventChangeLogFindFirstArgs
  ): Promise<EventChangeLog | null> {
    return await this.prisma.eventChangeLog.findFirst(args);
  }

  async findUniqueOrThrow(
    args: Prisma.EventChangeLogFindUniqueOrThrowArgs
  ): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventChangeLogFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventChangeLog,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventChangeLogCreateArgs): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.create(args);
  }

  async createMany(
    args: Prisma.EventChangeLogCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventChangeLog.createMany(args);
  }

  async update(args: Prisma.EventChangeLogUpdateArgs): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.update(args);
  }

  async updateMany(
    args: Prisma.EventChangeLogUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventChangeLog.updateMany(args);
  }

  async delete(args: Prisma.EventChangeLogDeleteArgs): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.delete(args);
  }

  async count(args: Prisma.EventChangeLogCountArgs): Promise<number> {
    return await this.prisma.eventChangeLog.count(args);
  }

  /* End */
}
