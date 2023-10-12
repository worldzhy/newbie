import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, WorkflowViewComponent} from '@prisma/client';

@Injectable()
export class WorkflowViewComponentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WorkflowViewComponentFindUniqueOrThrowArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.WorkflowViewComponentFindManyArgs) {
    return await this.prisma.workflowViewComponent.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WorkflowViewComponentFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.WorkflowViewComponent,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.WorkflowViewComponentCreateArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.create(args);
  }

  async createMany(
    args: Prisma.WorkflowViewComponentCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowViewComponent.createMany(args);
  }

  async update(
    args: Prisma.WorkflowViewComponentUpdateArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.update(args);
  }

  async delete(
    args: Prisma.WorkflowViewComponentDeleteArgs
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.delete(args);
  }

  /* End */
}
