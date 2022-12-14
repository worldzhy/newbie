import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationWorkflowNote} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationWorkflowNoteService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationWorkflowNoteFindUniqueArgs
  ): Promise<JobApplicationWorkflowNote | null> {
    return await this.prisma.jobApplicationWorkflowNote.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationWorkflowNoteFindUniqueOrThrowArgs
  ): Promise<JobApplicationWorkflowNote> {
    return await this.prisma.jobApplicationWorkflowNote.findUniqueOrThrow(
      params
    );
  }

  async findMany(
    params: Prisma.JobApplicationWorkflowNoteFindManyArgs
  ): Promise<JobApplicationWorkflowNote[]> {
    return await this.prisma.jobApplicationWorkflowNote.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationWorkflowNoteCreateArgs
  ): Promise<JobApplicationWorkflowNote> {
    return await this.prisma.jobApplicationWorkflowNote.create(params);
  }

  async update(
    params: Prisma.JobApplicationWorkflowNoteUpdateArgs
  ): Promise<JobApplicationWorkflowNote> {
    return await this.prisma.jobApplicationWorkflowNote.update(params);
  }

  async delete(
    params: Prisma.JobApplicationWorkflowNoteDeleteArgs
  ): Promise<JobApplicationWorkflowNote> {
    return await this.prisma.jobApplicationWorkflowNote.delete(params);
  }

  /* End */
}
