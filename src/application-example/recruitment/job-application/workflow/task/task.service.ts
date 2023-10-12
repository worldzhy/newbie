import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowTask} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowTaskService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findManyWithPagination(
    params: Prisma.JobApplicationWorkflowTaskFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.JobApplicationWorkflowTask,
      params,
      pagination
    );
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
