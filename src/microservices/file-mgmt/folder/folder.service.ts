import {Injectable} from '@nestjs/common';
import {Prisma, Folder} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.FolderFindUniqueOrThrowArgs
  ): Promise<Folder> {
    return await this.prisma.folder.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.FolderFindManyArgs): Promise<Folder[]> {
    return await this.prisma.folder.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.FolderFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Folder,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.FolderCreateArgs): Promise<Folder> {
    return await this.prisma.folder.create(args);
  }

  async update(args: Prisma.FolderUpdateArgs): Promise<Folder> {
    return await this.prisma.folder.update(args);
  }

  async delete(args: Prisma.FolderDeleteArgs): Promise<Folder> {
    return await this.prisma.folder.delete(args);
  }

  async checkExistence(id: number) {
    const count = await this.prisma.folder.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
