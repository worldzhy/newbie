import {Injectable} from '@nestjs/common';
import {Prisma, EventIssue} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventIssueService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.EventIssueFindUniqueOrThrowArgs
  ): Promise<EventIssue> {
    return await this.prisma.eventIssue.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.EventIssueFindManyArgs): Promise<EventIssue[]> {
    return await this.prisma.eventIssue.findMany(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.EventIssueFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.EventIssue,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventIssueFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventIssue,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventIssueCreateArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.create(args);
  }

  async createMany(
    args: Prisma.EventIssueCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventIssue.createMany(args);
  }

  async update(args: Prisma.EventIssueUpdateArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.update(args);
  }

  async updateMany(
    args: Prisma.EventIssueUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventIssue.updateMany(args);
  }

  async upsert(args: Prisma.EventIssueUpsertArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.upsert(args);
  }

  async delete(args: Prisma.EventIssueDeleteArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.delete(args);
  }

  /* End */
}
