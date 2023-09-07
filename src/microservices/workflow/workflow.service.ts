import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Workflow} from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WorkflowFindUniqueOrThrowArgs
  ): Promise<Workflow> {
    return await this.prisma.workflow.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WorkflowFindManyArgs) {
    return await this.prisma.workflow.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WorkflowFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Workflow,
      params,
      pagination
    );
  }

  async create(params: Prisma.WorkflowCreateArgs): Promise<Workflow> {
    return await this.prisma.workflow.create(params);
  }

  async update(params: Prisma.WorkflowUpdateArgs): Promise<Workflow> {
    return await this.prisma.workflow.update(params);
  }

  async delete(params: Prisma.WorkflowDeleteArgs): Promise<Workflow> {
    return await this.prisma.workflow.delete(params);
  }

  /* End */
}
