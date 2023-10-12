import {Injectable} from '@nestjs/common';
import {Prisma, TagGroup} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class TagGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.TagGroupFindUniqueOrThrowArgs
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.TagGroupFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.TagGroup,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.TagGroupCreateArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.create(args);
  }

  async createMany(
    args: Prisma.TagGroupCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tagGroup.createMany(args);
  }

  async update(args: Prisma.TagGroupUpdateArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.update(args);
  }

  async updateMany(
    args: Prisma.TagGroupUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tagGroup.updateMany(args);
  }

  async delete(args: Prisma.TagGroupDeleteArgs): Promise<TagGroup> {
    return await this.prisma.tagGroup.delete(args);
  }

  /* End */
}
