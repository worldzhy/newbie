import {Injectable} from '@nestjs/common';
import {Prisma, JobApplication} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    args: Prisma.JobApplicationFindUniqueArgs
  ): Promise<JobApplication | null> {
    return await this.prisma.jobApplication.findUnique(args);
  }

  async findUniqueOrThrow(
    args: Prisma.JobApplicationFindUniqueOrThrowArgs
  ): Promise<JobApplication> {
    return await this.prisma.jobApplication.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.JobApplicationFindManyArgs
  ): Promise<JobApplication[]> {
    return await this.prisma.jobApplication.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs: Prisma.JobApplicationFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.JobApplication,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.JobApplicationCreateArgs): Promise<JobApplication> {
    return await this.prisma.jobApplication.create(args);
  }

  async update(args: Prisma.JobApplicationUpdateArgs): Promise<JobApplication> {
    return await this.prisma.jobApplication.update(args);
  }

  async delete(args: Prisma.JobApplicationDeleteArgs): Promise<JobApplication> {
    return await this.prisma.jobApplication.delete(args);
  }

  async count(args: Prisma.JobApplicationCountArgs): Promise<number> {
    return await this.prisma.jobApplication.count(args);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.jobApplication.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
