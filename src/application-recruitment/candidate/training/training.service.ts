import {Injectable} from '@nestjs/common';
import {Prisma, CandidateTraining} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CandidateTrainingService {
  constructor(private prisma: PrismaService) {}

  async findUnique(
    params: Prisma.CandidateTrainingFindUniqueArgs
  ): Promise<CandidateTraining | null> {
    return await this.prisma.candidateTraining.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.CandidateTrainingFindUniqueOrThrowArgs
  ): Promise<CandidateTraining> {
    return await this.prisma.candidateTraining.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.CandidateTrainingFindManyArgs
  ): Promise<CandidateTraining[]> {
    return await this.prisma.candidateTraining.findMany(params);
  }

  async create(
    params: Prisma.CandidateTrainingCreateArgs
  ): Promise<CandidateTraining> {
    return await this.prisma.candidateTraining.create(params);
  }

  async update(
    params: Prisma.CandidateTrainingUpdateArgs
  ): Promise<CandidateTraining> {
    return await this.prisma.candidateTraining.update(params);
  }

  async delete(
    params: Prisma.CandidateTrainingDeleteArgs
  ): Promise<CandidateTraining> {
    return await this.prisma.candidateTraining.delete(params);
  }

  /* End */
}
