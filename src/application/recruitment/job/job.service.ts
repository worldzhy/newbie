import {Injectable} from '@nestjs/common';
import {Prisma, Job} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.JobFindUniqueArgs): Promise<Job | null> {
    return await this.prisma.job.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobFindUniqueOrThrowArgs
  ): Promise<Job> {
    return await this.prisma.job.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.JobFindManyArgs): Promise<Job[]> {
    return await this.prisma.job.findMany(params);
  }

  async create(params: Prisma.JobCreateArgs): Promise<Job> {
    return await this.prisma.job.create(params);
  }

  async update(params: Prisma.JobUpdateArgs): Promise<Job> {
    return await this.prisma.job.update(params);
  }

  async delete(params: Prisma.JobDeleteArgs): Promise<Job> {
    return await this.prisma.job.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.job.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
