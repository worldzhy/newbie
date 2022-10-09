import {Injectable} from '@nestjs/common';
import {Prisma, JobApplicationNote} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class JobApplicationNoteService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.JobApplicationNoteFindUniqueArgs
  ): Promise<JobApplicationNote | null> {
    return await this.prisma.jobApplicationNote.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.JobApplicationNoteFindUniqueOrThrowArgs
  ): Promise<JobApplicationNote> {
    return await this.prisma.jobApplicationNote.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.JobApplicationNoteFindManyArgs
  ): Promise<JobApplicationNote[]> {
    return await this.prisma.jobApplicationNote.findMany(params);
  }

  async create(
    params: Prisma.JobApplicationNoteCreateArgs
  ): Promise<JobApplicationNote> {
    return await this.prisma.jobApplicationNote.create(params);
  }

  async update(
    params: Prisma.JobApplicationNoteUpdateArgs
  ): Promise<JobApplicationNote> {
    return await this.prisma.jobApplicationNote.update(params);
  }

  async delete(
    params: Prisma.JobApplicationNoteDeleteArgs
  ): Promise<JobApplicationNote> {
    return await this.prisma.jobApplicationNote.delete(params);
  }

  /* End */
}
