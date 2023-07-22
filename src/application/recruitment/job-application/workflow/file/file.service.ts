import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowFile} from '@prisma/client';
import {PrismaService} from '../../../../../toolkit/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowFileService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.JobApplicationWorkflowFileFindUniqueArgs
  ): Promise<JobApplicationWorkflowFile | null> {
    return await this.prisma.jobApplicationWorkflowFile.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationWorkflowFileFindUniqueOrThrowArgs
  ): Promise<JobApplicationWorkflowFile> {
    return await this.prisma.jobApplicationWorkflowFile.findUniqueOrThrow(
      params
    );
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowFileFindManyArgs
  ): Promise<JobApplicationWorkflowFile[]> {
    return await this.prisma.jobApplicationWorkflowFile.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationWorkflowFileCreateArgs
  ): Promise<JobApplicationWorkflowFile> {
    return await this.prisma.jobApplicationWorkflowFile.create(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowFileUpdateArgs
  ): Promise<JobApplicationWorkflowFile> {
    return await this.prisma.jobApplicationWorkflowFile.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowFileDeleteArgs
  ): Promise<JobApplicationWorkflowFile> {
    return await this.prisma.jobApplicationWorkflowFile.delete(params);
  }

  /* End */
}
