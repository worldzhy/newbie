import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflow} from '@prisma/client';
import {PrismaService} from '../../../../toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.JobApplicationWorkflowFindUniqueArgs
  ): Promise<JobApplicationWorkflow | null> {
    return await this.prisma.jobApplicationWorkflow.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationWorkflowFindUniqueOrThrowArgs
  ): Promise<JobApplicationWorkflow> {
    return await this.prisma.jobApplicationWorkflow.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowFindManyArgs
  ): Promise<JobApplicationWorkflow[]> {
    return await this.prisma.jobApplicationWorkflow.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationWorkflowCreateArgs
  ): Promise<JobApplicationWorkflow> {
    return await this.prisma.jobApplicationWorkflow.create(params);
  }

  async createMany(
    params: Prisma.JobApplicationWorkflowCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.jobApplicationWorkflow.createMany(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowUpdateArgs
  ): Promise<JobApplicationWorkflow> {
    return await this.prisma.jobApplicationWorkflow.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowDeleteArgs
  ): Promise<JobApplicationWorkflow> {
    return await this.prisma.jobApplicationWorkflow.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.jobApplicationWorkflow.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
