import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Workflow} from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.WorkflowFindUniqueOrThrowArgs
  ): Promise<Workflow> {
    return await this.prisma.workflow.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.WorkflowFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Workflow,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.WorkflowCreateArgs): Promise<Workflow> {
    return await this.prisma.workflow.create(args);
  }

  async update(args: Prisma.WorkflowUpdateArgs): Promise<Workflow> {
    return await this.prisma.workflow.update(args);
  }

  async delete(args: Prisma.WorkflowDeleteArgs): Promise<Workflow> {
    return await this.prisma.workflow.delete(args);
  }

  /* End */
}
