import {Injectable} from '@nestjs/common';
import {Prisma, Tag} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(args: Prisma.TagFindUniqueOrThrowArgs): Promise<Tag> {
    return await this.prisma.tag.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.TagFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Tag,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.TagFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Tag,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.TagCreateArgs): Promise<Tag> {
    return await this.prisma.tag.create(args);
  }

  async createMany(
    args: Prisma.TagCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tag.createMany(args);
  }

  async update(args: Prisma.TagUpdateArgs): Promise<Tag> {
    return await this.prisma.tag.update(args);
  }

  async updateMany(
    args: Prisma.TagUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.tag.updateMany(args);
  }

  async delete(args: Prisma.TagDeleteArgs): Promise<Tag> {
    return await this.prisma.tag.delete(args);
  }

  /* End */
}
