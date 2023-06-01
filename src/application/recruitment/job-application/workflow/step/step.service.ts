import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowStep} from '@prisma/client';
import {PrismaService} from '../../../../../toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowStepService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationWorkflowStepFindUniqueArgs
  ): Promise<JobApplicationWorkflowStep | null> {
    return await this.prisma.jobApplicationWorkflowStep.findUnique(params);
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowStepFindManyArgs
  ): Promise<JobApplicationWorkflowStep[]> {
    return await this.prisma.jobApplicationWorkflowStep.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationWorkflowStepCreateArgs
  ): Promise<JobApplicationWorkflowStep> {
    return await this.prisma.jobApplicationWorkflowStep.create(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowStepUpdateArgs
  ): Promise<JobApplicationWorkflowStep> {
    return await this.prisma.jobApplicationWorkflowStep.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowStepDeleteArgs
  ): Promise<JobApplicationWorkflowStep> {
    return await this.prisma.jobApplicationWorkflowStep.delete(params);
  }

  async count(
    params: Prisma.JobApplicationWorkflowStepCountArgs
  ): Promise<number> {
    return await this.prisma.jobApplicationWorkflowStep.count(params);
  }

  /* End */
}
