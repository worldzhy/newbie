import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {Prisma, WorkflowView} from '@prisma/client';

@Injectable()
export class WorkflowViewService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.WorkflowViewFindUniqueArgs
  ): Promise<WorkflowView | null> {
    return await this.prisma.workflowView.findUnique(params);
  }

  async findMany(params: Prisma.WorkflowViewFindManyArgs) {
    return await this.prisma.workflowView.findMany(params);
  }

  async create(params: Prisma.WorkflowViewCreateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.create(params);
  }

  async update(params: Prisma.WorkflowViewUpdateArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.update(params);
  }

  async delete(params: Prisma.WorkflowViewDeleteArgs): Promise<WorkflowView> {
    return await this.prisma.workflowView.delete(params);
  }

  /* End */
}
