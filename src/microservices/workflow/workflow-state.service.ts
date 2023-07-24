import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../toolkit/prisma/prisma.service';
import {Prisma, WorkflowState} from '@prisma/client';

@Injectable()
export class WorkflowStateService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.WorkflowStateFindUniqueArgs
  ): Promise<WorkflowState | null> {
    return await this.prisma.workflowState.findUnique(params);
  }

  async findMany(params: Prisma.WorkflowStateFindManyArgs) {
    return await this.prisma.workflowState.findMany(params);
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
