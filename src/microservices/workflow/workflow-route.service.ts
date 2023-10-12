import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowRoute} from '@prisma/client';

@Injectable()
export class WorkflowRouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WorkflowRouteFindUniqueOrThrowArgs
  ): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.findUniqueOrThrow(args);
  }

  async findFirstOrThrow(
    args: Prisma.WorkflowRouteFindFirstOrThrowArgs
  ): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.findFirstOrThrow(args);
  }

  async findMany(args: Prisma.WorkflowRouteFindManyArgs) {
    return await this.prisma.workflowRoute.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WorkflowRouteFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.WorkflowRoute,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WorkflowRouteCreateArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.create(args);
  }

  async createMany(
    args: Prisma.WorkflowRouteCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowRoute.createMany(args);
  }

  async update(args: Prisma.WorkflowRouteUpdateArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.update(args);
  }

  async updateMany(
    args: Prisma.WorkflowRouteUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowRoute.updateMany(args);
  }

  async delete(args: Prisma.WorkflowRouteDeleteArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.delete(args);
  }

  /* End */
}
