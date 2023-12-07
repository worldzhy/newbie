import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowTrail} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    args: Prisma.JobApplicationWorkflowTrailFindUniqueArgs
  ): Promise<JobApplicationWorkflowTrail | null> {
    return await this.prisma.jobApplicationWorkflowTrail.findUnique(args);
  }

  async findMany(
    args: Prisma.JobApplicationWorkflowTrailFindManyArgs
  ): Promise<JobApplicationWorkflowTrail[]> {
    return await this.prisma.jobApplicationWorkflowTrail.findMany(args);
  }

  async findManyInManyPages(
    pagination: {
      page: number;
      pageSize: number;
    },
    findManyArgs: Prisma.JobApplicationWorkflowTrailFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.JobApplicationWorkflowTrail,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.JobApplicationWorkflowTrailCreateArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.create(args);
  }

  async update(
    args: Prisma.JobApplicationWorkflowTrailUpdateArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.update(args);
  }

  async delete(
    args: Prisma.JobApplicationWorkflowTrailDeleteArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.delete(args);
  }

  async count(
    args: Prisma.JobApplicationWorkflowTrailCountArgs
  ): Promise<number> {
    return await this.prisma.jobApplicationWorkflowTrail.count(args);
  }

  /* End */
}
