import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {Prisma, WorkflowStep} from '@prisma/client';

@Injectable()
export class WorkflowStepService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.WorkflowStepFindUniqueArgs
  ): Promise<WorkflowStep | null> {
    return await this.prisma.workflowStep.findUnique(params);
  }

  async findMany(params: Prisma.WorkflowStepFindManyArgs) {
    return await this.prisma.workflowStep.findMany(params);
  }

  async create(params: Prisma.WorkflowStepCreateArgs): Promise<WorkflowStep> {
    return await this.prisma.workflowStep.create(params);
  }

  async update(params: Prisma.WorkflowStepUpdateArgs): Promise<WorkflowStep> {
    return await this.prisma.workflowStep.update(params);
  }

  async delete(params: Prisma.WorkflowStepDeleteArgs): Promise<WorkflowStep> {
    return await this.prisma.workflowStep.delete(params);
  }

  /* End */
}
