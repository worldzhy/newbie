import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../toolkits/prisma/prisma.service';
import {Prisma, Workflow} from '@prisma/client';

@Injectable()
export class WorkflowService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.WorkflowFindUniqueArgs
  ): Promise<Workflow | null> {
    return await this.prisma.workflow.findUnique(params);
  }

  async findMany(params: Prisma.WorkflowFindManyArgs) {
    return await this.prisma.workflow.findMany(params);
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
