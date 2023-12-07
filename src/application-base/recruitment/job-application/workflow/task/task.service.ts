import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowTask} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowTaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    args: Prisma.JobApplicationWorkflowTaskFindUniqueArgs
  ): Promise<JobApplicationWorkflowTask | null> {
    return await this.prisma.jobApplicationWorkflowTask.findUnique(args);
  }

  async findUniqueOrThrow(
    args: Prisma.JobApplicationWorkflowTaskFindUniqueOrThrowArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.JobApplicationWorkflowTaskFindManyArgs
  ): Promise<JobApplicationWorkflowTask[]> {
    return await this.prisma.jobApplicationWorkflowTask.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.JobApplicationWorkflowTaskFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.JobApplicationWorkflowTask,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.JobApplicationWorkflowTaskCreateArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.create(args);
  }

  async update(
    args: Prisma.JobApplicationWorkflowTaskUpdateArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.update(args);
  }

  async delete(
    args: Prisma.JobApplicationWorkflowTaskDeleteArgs
  ): Promise<JobApplicationWorkflowTask> {
    return await this.prisma.jobApplicationWorkflowTask.delete(args);
  }

  /* End */
}
