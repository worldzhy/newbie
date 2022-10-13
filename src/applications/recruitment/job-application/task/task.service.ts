import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationTask} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationTaskService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationTaskFindUniqueArgs
  ): Promise<JobApplicationTask | null> {
    return await this.prisma.jobApplicationTask.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationTaskFindUniqueOrThrowArgs
  ): Promise<JobApplicationTask> {
    return await this.prisma.jobApplicationTask.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.JobApplicationTaskFindManyArgs
  ): Promise<JobApplicationTask[]> {
    return await this.prisma.jobApplicationTask.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationTaskCreateArgs
  ): Promise<JobApplicationTask> {
    return await this.prisma.jobApplicationTask.create(params);
  }

  async update(
    params: Prisma.JobApplicationTaskUpdateArgs
  ): Promise<JobApplicationTask> {
    return await this.prisma.jobApplicationTask.update(params);
  }

  async delete(
    params: Prisma.JobApplicationTaskDeleteArgs
  ): Promise<JobApplicationTask> {
    return await this.prisma.jobApplicationTask.delete(params);
  }

  /* End */
}
