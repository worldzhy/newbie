import {Injectable} from '@nestjs/common';
import {Prisma, TagGroup} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class TagGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.TagGroupFindUniqueArgs
  ): Promise<TagGroup | null> {
    return await this.prisma.tagGroup.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.TagGroupFindUniqueOrThrowArgs
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.TagGroupFindManyArgs): Promise<TagGroup[]> {
    return await this.prisma.tagGroup.findMany(params);
  }

  async create(params: Prisma.TagGroupCreateArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.create(params);
  }

  async createMany(
    params: Prisma.TagGroupCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tagGroup.createMany(params);
  }

  async update(params: Prisma.TagGroupUpdateArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.update(params);
  }

  async updateMany(
    params: Prisma.TagGroupUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tagGroup.updateMany(params);
  }

  async delete(params: Prisma.TagGroupDeleteArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.delete(params);
  }

  /* End */
}
