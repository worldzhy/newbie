import {Injectable} from '@nestjs/common';
import {Prisma, Spu} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class SpuService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(args: Prisma.SpuFindUniqueOrThrowArgs): Promise<Spu> {
    return await this.prisma.spu.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.SpuFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Spu,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.SpuCreateArgs): Promise<Spu> {
    return await this.prisma.spu.create(args);
  }

  async update(args: Prisma.SpuUpdateArgs): Promise<Spu> {
    return await this.prisma.spu.update(args);
  }

  async delete(args: Prisma.SpuDeleteArgs): Promise<Spu> {
    return await this.prisma.spu.delete(args);
  }

  /* End */
}
