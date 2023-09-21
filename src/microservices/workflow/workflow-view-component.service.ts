import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowViewComponent} from '@prisma/client';

@Injectable()
export class WorkflowViewComponentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.WorkflowViewComponentFindUniqueOrThrowArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WorkflowViewComponentFindManyArgs) {
    return await this.prisma.workflowViewComponent.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.WorkflowViewComponentFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.WorkflowViewComponent,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.WorkflowViewComponentCreateArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.create(params);
  }

  async createMany(
    params: Prisma.WorkflowViewComponentCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowViewComponent.createMany(params);
  }

  async update(
    params: Prisma.WorkflowViewComponentUpdateArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.update(params);
  }

  async delete(
    params: Prisma.WorkflowViewComponentDeleteArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.delete(params);
  }

  /* End */
}
