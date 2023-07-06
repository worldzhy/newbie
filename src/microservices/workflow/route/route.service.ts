import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {Prisma, WorkflowRoute} from '@prisma/client';

@Injectable()
export class WorkflowRouteService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.WorkflowRouteFindUniqueArgs
  ): Promise<WorkflowRoute | null> {
    return await this.prisma.workflowRoute.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.WorkflowRouteFindUniqueOrThrowArgs
  ): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.WorkflowRouteFindManyArgs) {
    return await this.prisma.workflowRoute.findMany(params);
  }

  async create(params: Prisma.WorkflowRouteCreateArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.create(params);
  }

  async update(params: Prisma.WorkflowRouteUpdateArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.update(params);
  }

  async updateMany(
    params: Prisma.WorkflowRouteUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.workflowRoute.updateMany(params);
  }

  async delete(params: Prisma.WorkflowRouteDeleteArgs): Promise<WorkflowRoute> {
    return await this.prisma.workflowRoute.delete(params);
  }

  /* End */
}
