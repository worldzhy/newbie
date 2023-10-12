import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowTrail} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowTrailService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.JobApplicationWorkflowTrailFindUniqueArgs
  ): Promise<JobApplicationWorkflowTrail | null> {
    return await this.prisma.jobApplicationWorkflowTrail.findUnique(params);
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowTrailFindManyArgs
  ): Promise<JobApplicationWorkflowTrail[]> {
    return await this.prisma.jobApplicationWorkflowTrail.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.JobApplicationWorkflowTrailFindManyArgs,
    pagination?: {
      page: number;
      pageSize: number;
    }
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.JobApplicationWorkflowTrail,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.JobApplicationWorkflowTrailCreateArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.create(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowTrailUpdateArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowTrailDeleteArgs
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.delete(params);
  }

  async count(
    params: Prisma.JobApplicationWorkflowTrailCountArgs
  ): Promise<number> {
    return await this.prisma.jobApplicationWorkflowTrail.count(params);
  }

  /* End */
}
