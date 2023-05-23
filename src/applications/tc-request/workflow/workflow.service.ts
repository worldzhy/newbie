import {Injectable} from '@nestjs/common';
import {Prisma, TcWorkflow} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

export const WorkflowStatus = {
  PendingFill: 'PendingFill',
  PendingReview: 'PendingReview',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  PickedUp: 'PickedUp',
};

@Injectable()
export class TcWorkflowService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.TcWorkflowFindUniqueArgs
  ): Promise<TcWorkflow | null> {
    return await this.prisma.tcWorkflow.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.TcWorkflowFindUniqueOrThrowArgs
  ): Promise<TcWorkflow> {
    return await this.prisma.tcWorkflow.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.TcWorkflowFindManyArgs): Promise<TcWorkflow[]> {
    return await this.prisma.tcWorkflow.findMany(params);
  }

  async findManyWithTotal(
    params: Prisma.TcWorkflowFindManyArgs
  ): Promise<[TcWorkflow[], number]> {
    return await this.prisma.$transaction([
      this.prisma.tcWorkflow.findMany(params),
      this.prisma.tcWorkflow.count({where: params.where}),
    ]);
  }

  async create(params: Prisma.TcWorkflowCreateArgs): Promise<TcWorkflow> {
    return await this.prisma.tcWorkflow.create(params);
  }

  async createMany(
    params: Prisma.TcWorkflowCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tcWorkflow.createMany(params);
  }

  async update(params: Prisma.TcWorkflowUpdateArgs): Promise<TcWorkflow> {
    return await this.prisma.tcWorkflow.update(params);
  }

  async delete(params: Prisma.TcWorkflowDeleteArgs): Promise<TcWorkflow> {
    return await this.prisma.tcWorkflow.delete(params);
  }

  async checkExistence(params: Prisma.TcWorkflowFindManyArgs) {
    const count = await this.prisma.tcWorkflow.count({where: params.where});
    return count > 0 ? true : false;
  }

  /* End */
}
