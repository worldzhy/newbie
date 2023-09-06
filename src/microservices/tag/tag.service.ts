import {Injectable} from '@nestjs/common';
import {Prisma, Tag} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.TagFindUniqueArgs): Promise<Tag | null> {
    return await this.prisma.tag.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.TagFindUniqueOrThrowArgs
  ): Promise<Tag> {
    return await this.prisma.tag.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.TagFindManyArgs): Promise<Tag[]> {
    return await this.prisma.tag.findMany(params);
  }

  async findManyWithTotal(
    params: Prisma.TagFindManyArgs
  ): Promise<[Tag[], number]> {
    return await this.prisma.$transaction([
      this.prisma.tag.findMany(params),
      this.prisma.tag.count({where: params.where}),
    ]);
  }

  async create(params: Prisma.TagCreateArgs): Promise<Tag> {
    return await this.prisma.tag.create(params);
  }

  async createMany(
    params: Prisma.TagCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tag.createMany(params);
  }

  async update(params: Prisma.TagUpdateArgs): Promise<Tag> {
    return await this.prisma.tag.update(params);
  }

  async updateMany(
    params: Prisma.TagUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tag.updateMany(params);
  }

  async delete(params: Prisma.TagDeleteArgs): Promise<Tag> {
    return await this.prisma.tag.delete(params);
  }

  /* End */
}
