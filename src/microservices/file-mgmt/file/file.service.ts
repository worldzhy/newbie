import {Injectable} from '@nestjs/common';
import {Prisma, File} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.FileFindUniqueOrThrowArgs
  ): Promise<File> {
    return await this.prisma.file.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.FileFindManyArgs): Promise<File[]> {
    return await this.prisma.file.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.FileFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.File,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.FileCreateArgs): Promise<File> {
    return await this.prisma.file.create(args);
  }

  async update(args: Prisma.FileUpdateArgs): Promise<File> {
    return await this.prisma.file.update(args);
  }

  async delete(args: Prisma.FileDeleteArgs): Promise<File> {
    return await this.prisma.file.delete(args);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.file.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
