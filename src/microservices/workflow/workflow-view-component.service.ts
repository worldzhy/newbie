import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowViewComponent} from '@prisma/client';

@Injectable()
export class WorkflowViewComponentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.WorkflowViewComponentFindUniqueArgs
  ): Promise<WorkflowViewComponent | null> {
    return await this.prisma.workflowViewComponent.findUnique(params);
  }

  async findMany(params: Prisma.WorkflowViewComponentFindManyArgs) {
    return await this.prisma.workflowViewComponent.findMany(params);
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
