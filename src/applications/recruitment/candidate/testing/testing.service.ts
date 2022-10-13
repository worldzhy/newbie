import {Injectable} from '@nestjs/common';
import {Prisma, CandidateTesting} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class CandidateTestingService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.CandidateTestingFindUniqueArgs
  ): Promise<CandidateTesting | null> {
    return await this.prisma.candidateTesting.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.CandidateTestingFindUniqueOrThrowArgs
  ): Promise<CandidateTesting> {
    return await this.prisma.candidateTesting.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.CandidateTestingFindManyArgs
  ): Promise<CandidateTesting[]> {
    return await this.prisma.candidateTesting.findMany(params);
  }

  async create(
    params: Prisma.CandidateTestingCreateArgs
  ): Promise<CandidateTesting> {
    return await this.prisma.candidateTesting.create(params);
  }

  async update(
    params: Prisma.CandidateTestingUpdateArgs
  ): Promise<CandidateTesting> {
    return await this.prisma.candidateTesting.update(params);
  }

  async delete(
    params: Prisma.CandidateTestingDeleteArgs
  ): Promise<CandidateTesting> {
    return await this.prisma.candidateTesting.delete(params);
  }

  /* End */
}
