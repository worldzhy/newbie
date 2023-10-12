import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowState} from '@prisma/client';

@Injectable()
export class WorkflowStateService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WorkflowStateFindUniqueOrThrowArgs
  ): Promise<WorkflowState> {
    return await this.prisma.workflowState.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.WorkflowStateFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.WorkflowState,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WorkflowStateFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.WorkflowState,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WorkflowStateCreateArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.create(args);
  }

  async createMany(
    args: Prisma.WorkflowStateCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowState.createMany(args);
  }

  async update(args: Prisma.WorkflowStateUpdateArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.update(args);
  }

  async delete(args: Prisma.WorkflowStateDeleteArgs): Promise<WorkflowState> {
    return await this.prisma.workflowState.delete(args);
  }

  /* End */
}
