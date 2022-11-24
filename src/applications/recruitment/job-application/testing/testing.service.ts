import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationTesting} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationTestingService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationTestingFindUniqueArgs
  ): Promise<JobApplicationTesting | null> {
    return await this.prisma.jobApplicationTesting.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationTestingFindUniqueOrThrowArgs
  ): Promise<JobApplicationTesting> {
    return await this.prisma.jobApplicationTesting.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.JobApplicationTestingFindManyArgs
  ): Promise<JobApplicationTesting[]> {
    return await this.prisma.jobApplicationTesting.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationTestingCreateArgs
  ): Promise<JobApplicationTesting> {
    return await this.prisma.jobApplicationTesting.create(params);
  }

  async createMany(
    params: Prisma.JobApplicationTestingCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.jobApplicationTesting.createMany(params);
  }

  async update(
    params: Prisma.JobApplicationTestingUpdateArgs
  ): Promise<JobApplicationTesting> {
    return await this.prisma.jobApplicationTesting.update(params);
  }

  async delete(
    params: Prisma.JobApplicationTestingDeleteArgs
  ): Promise<JobApplicationTesting> {
    return await this.prisma.jobApplicationTesting.delete(params);
  }

  /* End */
}
