import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowView} from '@prisma/client';

@Injectable()
export class WorkflowViewService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WorkflowViewFindUniqueOrThrowArgs
  ): Promise<WorkflowView> {
    return await this.prisma.workflowView.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WorkflowViewFindManyArgs) {
    return await this.prisma.workflowView.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WorkflowViewFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.WorkflowView,
      params,
      pagination
    );
  }

  async create(params: Prisma.WorkflowViewCreateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.create(params);
  }

  async createMany(
    params: Prisma.WorkflowViewCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowView.createMany(params);
  }

  async update(params: Prisma.WorkflowViewUpdateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.update(params);
  }

  async delete(params: Prisma.WorkflowViewDeleteArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.delete(params);
  }

  /* End */
}
