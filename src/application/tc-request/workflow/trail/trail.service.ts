import {Injectable} from '@nestjs/common';
import {Prisma, TcWorkflowTrail} from '@prisma/client';
import {PrismaService} from '../../../../toolkit/prisma/prisma.service';

@Injectable()
export class TcWorkflowTrailService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.TcWorkflowTrailFindUniqueArgs
  ): Promise<TcWorkflowTrail | null> {
    return await this.prisma.tcWorkflowTrail.findUnique(params);
  }

  async findMany(
    params: Prisma.TcWorkflowTrailFindManyArgs
  ): Promise<TcWorkflowTrail[]> {
    return await this.prisma.tcWorkflowTrail.findMany(params);
  }

  async create(
    params: Prisma.TcWorkflowTrailCreateArgs
  ): Promise<TcWorkflowTrail> {
    return await this.prisma.tcWorkflowTrail.create(params);
  }

  async update(
    params: Prisma.TcWorkflowTrailUpdateArgs
  ): Promise<TcWorkflowTrail> {
    return await this.prisma.tcWorkflowTrail.update(params);
  }

  async delete(
    params: Prisma.TcWorkflowTrailDeleteArgs
  ): Promise<TcWorkflowTrail> {
    return await this.prisma.tcWorkflowTrail.delete(params);
  }

  async count(params: Prisma.TcWorkflowTrailCountArgs): Promise<number> {
    return await this.prisma.tcWorkflowTrail.count(params);
  }

  /* End */
}
