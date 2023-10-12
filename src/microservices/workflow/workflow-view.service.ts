import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowView} from '@prisma/client';

@Injectable()
export class WorkflowViewService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WorkflowViewFindUniqueOrThrowArgs
  ): Promise<WorkflowView> {
    return await this.prisma.workflowView.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.WorkflowViewFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.WorkflowView,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WorkflowViewFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.WorkflowView,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WorkflowViewCreateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.create(args);
  }

  async createMany(
    args: Prisma.WorkflowViewCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowView.createMany(args);
  }

  async update(args: Prisma.WorkflowViewUpdateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.update(args);
  }

  async delete(args: Prisma.WorkflowViewDeleteArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.delete(args);
  }

  /* End */
}
