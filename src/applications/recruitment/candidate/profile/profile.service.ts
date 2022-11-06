import {Injectable} from '@nestjs/common';
import {Prisma, CandidateProfile} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class CandidateProfileService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.CandidateProfileFindUniqueArgs
  ): Promise<CandidateProfile | null> {
    return await this.prisma.candidateProfile.findUnique(params);
  }

  async findMany(
    params: Prisma.CandidateProfileFindManyArgs
  ): Promise<CandidateProfile[]> {
    return await this.prisma.candidateProfile.findMany(params);
  }

  async create(
    params: Prisma.CandidateProfileCreateArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.create(params);
  }

  async update(
    params: Prisma.CandidateProfileUpdateArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.update(params);
  }

  async delete(
    params: Prisma.CandidateProfileDeleteArgs
  ): Promise<CandidateProfile> {
    return await this.prisma.candidateProfile.delete(params);
  }

  /* End */
}
