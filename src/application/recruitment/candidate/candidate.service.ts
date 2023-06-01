import {Injectable} from '@nestjs/common';
import {Prisma, Candidate} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class CandidateService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.CandidateFindUniqueArgs
  ): Promise<Candidate | null> {
    return await this.prisma.candidate.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.CandidateFindUniqueOrThrowArgs
  ): Promise<Candidate> {
    return await this.prisma.candidate.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.CandidateFindManyArgs): Promise<Candidate[]> {
    return await this.prisma.candidate.findMany(params);
  }

  async create(params: Prisma.CandidateCreateArgs): Promise<Candidate> {
    return await this.prisma.candidate.create(params);
  }

  async update(params: Prisma.CandidateUpdateArgs): Promise<Candidate> {
    return await this.prisma.candidate.update(params);
  }

  async delete(params: Prisma.CandidateDeleteArgs): Promise<Candidate> {
    return await this.prisma.candidate.delete(params);
  }

  async count(params: Prisma.CandidateCountArgs): Promise<number> {
    return await this.prisma.candidate.count(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.candidate.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
