import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationProcessingStep} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class ProcessingStepService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationProcessingStepFindUniqueArgs
  ): Promise<JobApplicationProcessingStep | null> {
    return await this.prisma.jobApplicationProcessingStep.findUnique(params);
  }

  async findMany(
    params: Prisma.JobApplicationProcessingStepFindManyArgs
  ): Promise<JobApplicationProcessingStep[]> {
    return await this.prisma.jobApplicationProcessingStep.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationProcessingStepCreateArgs
  ): Promise<JobApplicationProcessingStep> {
    return await this.prisma.jobApplicationProcessingStep.create(params);
  }

  async update(
    params: Prisma.JobApplicationProcessingStepUpdateArgs
  ): Promise<JobApplicationProcessingStep> {
    return await this.prisma.jobApplicationProcessingStep.update(params);
  }

  async delete(
    params: Prisma.JobApplicationProcessingStepDeleteArgs
  ): Promise<JobApplicationProcessingStep> {
    return await this.prisma.jobApplicationProcessingStep.delete(params);
  }

  /* End */
}
