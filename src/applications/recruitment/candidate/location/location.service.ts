import {Injectable} from '@nestjs/common';
import {Prisma, CandidateLocation} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class CandidateLocationService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.CandidateLocationFindUniqueArgs
  ): Promise<CandidateLocation | null> {
    return await this.prisma.candidateLocation.findUnique(params);
  }

  async findMany(
    params: Prisma.CandidateLocationFindManyArgs
  ): Promise<CandidateLocation[]> {
    return await this.prisma.candidateLocation.findMany(params);
  }

  async create(params: Prisma.CandidateLocationCreateArgs): Promise<CandidateLocation> {
    return await this.prisma.candidateLocation.create(params);
  }

  async update(params: Prisma.CandidateLocationUpdateArgs): Promise<CandidateLocation> {
    return await this.prisma.candidateLocation.update(params);
  }

  async delete(params: Prisma.CandidateLocationDeleteArgs): Promise<CandidateLocation> {
    return await this.prisma.candidateLocation.delete(params);
  }

  /* End */
}
