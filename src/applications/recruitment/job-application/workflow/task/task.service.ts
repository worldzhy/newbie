import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowTask} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowTaskService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationWorkflowTaskFindUniqueArgs
  ): Promise<JobApplicationWorkflowTask | null> {
    return await this.prisma.jobApplicationWorkflowTask.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationWorkflowTaskFindUniqueOrThrowArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.findUniqueOrThrow(
      params
    );
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowTaskFindManyArgs
  ): Promise<JobApplicationWorkflowTask[]> {
    return await this.prisma.jobApplicationWorkflowTask.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationWorkflowTaskCreateArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.create(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowTaskUpdateArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowTaskDeleteArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.delete(params);
  }

  /* End */
}
