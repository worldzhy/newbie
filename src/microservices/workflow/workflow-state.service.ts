import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowState} from '@prisma/client';

@Injectable()
export class WorkflowStateService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WorkflowStateFindUniqueOrThrowArgs
  ): Promise<WorkflowState> {
    return await this.prisma.workflowState.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WorkflowStateFindManyArgs) {
    return await this.prisma.workflowState.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WorkflowStateFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.WorkflowState,
      params,
      pagination
    );
  }

  async create(params: Prisma.WorkflowStateCreateArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.create(params);
  }

  async createMany(
    params: Prisma.WorkflowStateCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowState.createMany(params);
  }

  async update(params: Prisma.WorkflowStateUpdateArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.update(params);
  }

  async delete(params: Prisma.WorkflowStateDeleteArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.delete(params);
  }

  /* End */
}
