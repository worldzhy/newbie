import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationTestingWorkflow} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationTestingWorkflowService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationTestingWorkflowFindUniqueArgs
  ): Promise<JobApplicationTestingWorkflow | null> {
    return await this.prisma.jobApplicationTestingWorkflow.findUnique(params);
  }

  async findMany(
    params: Prisma.JobApplicationTestingWorkflowFindManyArgs
  ): Promise<JobApplicationTestingWorkflow[]> {
    return await this.prisma.jobApplicationTestingWorkflow.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationTestingWorkflowCreateArgs
  ): Promise<JobApplicationTestingWorkflow> {
    return await this.prisma.jobApplicationTestingWorkflow.create(params);
  }

  async update(
    params: Prisma.JobApplicationTestingWorkflowUpdateArgs
  ): Promise<JobApplicationTestingWorkflow> {
    return await this.prisma.jobApplicationTestingWorkflow.update(params);
  }

  async delete(
    params: Prisma.JobApplicationTestingWorkflowDeleteArgs
  ): Promise<JobApplicationTestingWorkflow> {
    return await this.prisma.jobApplicationTestingWorkflow.delete(params);
  }

  async count(
    params: Prisma.JobApplicationTestingWorkflowCountArgs
  ): Promise<number> {
    return await this.prisma.jobApplicationTestingWorkflow.count(params);
  }

  /* End */
}
