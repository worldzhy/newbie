import {Injectable} from '@nestjs/common';
import {Prisma, CandidateCertification} from '@prisma/client';
import {PrismaService} from '../../../../toolkit/prisma/prisma.service';

@Injectable()
export class CandidateCertificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.CandidateCertificationFindUniqueArgs
  ): Promise<CandidateCertification | null> {
    return await this.prisma.candidateCertification.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.CandidateCertificationFindUniqueOrThrowArgs
  ): Promise<CandidateCertification> {
    return await this.prisma.candidateCertification.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.CandidateCertificationFindManyArgs
  ): Promise<CandidateCertification[]> {
    return await this.prisma.candidateCertification.findMany(params);
  }

  async create(
    params: Prisma.CandidateCertificationCreateArgs
  ): Promise<CandidateCertification> {
    return await this.prisma.candidateCertification.create(params);
  }

  async update(
    params: Prisma.CandidateCertificationUpdateArgs
  ): Promise<CandidateCertification> {
    return await this.prisma.candidateCertification.update(params);
  }

  async delete(
    params: Prisma.CandidateCertificationDeleteArgs
  ): Promise<CandidateCertification> {
    return await this.prisma.candidateCertification.delete(params);
  }

  /* End */
}
