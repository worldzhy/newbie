import {Injectable} from '@nestjs/common';
import {Prisma, Spu} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SpuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.SpuFindUniqueArgs): Promise<Spu | null> {
    return await this.prisma.spu.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.SpuFindUniqueOrThrowArgs
  ): Promise<Spu> {
    return await this.prisma.spu.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.SpuFindManyArgs): Promise<Spu[]> {
    return await this.prisma.spu.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.SpuFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Spu,
      params,
      pagination
    );
  }

  async create(params: Prisma.SpuCreateArgs): Promise<Spu> {
    return await this.prisma.spu.create(params);
  }

  async update(params: Prisma.SpuUpdateArgs): Promise<Spu> {
    return await this.prisma.spu.update(params);
  }

  async delete(params: Prisma.SpuDeleteArgs): Promise<Spu> {
    return await this.prisma.spu.delete(params);
  }

  /* End */
}
