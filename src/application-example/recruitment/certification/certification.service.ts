import {Injectable} from '@nestjs/common';
import {Prisma, Certification} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CertificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.CertificationFindUniqueArgs
  ): Promise<Certification | null> {
    return await this.prisma.certification.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.CertificationFindUniqueOrThrowArgs
  ): Promise<Certification> {
    return await this.prisma.certification.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.CertificationFindManyArgs
  ): Promise<Certification[]> {
    return await this.prisma.certification.findMany(params);
  }

  async create(params: Prisma.CertificationCreateArgs): Promise<Certification> {
    return await this.prisma.certification.create(params);
  }

  async update(params: Prisma.CertificationUpdateArgs): Promise<Certification> {
    return await this.prisma.certification.update(params);
  }

  async delete(params: Prisma.CertificationDeleteArgs): Promise<Certification> {
    return await this.prisma.certification.delete(params);
  }

  /* End */
}
