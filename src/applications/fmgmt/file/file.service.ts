import {Injectable, StreamableFile} from '@nestjs/common';
import {Prisma, File} from '@prisma/client';
import {createReadStream} from 'fs';
import {join} from 'path';
import {getFileManagementConfig} from '../../../_config/_fmgmt.config';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class FileService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(params: Prisma.FileFindUniqueArgs): Promise<File | null> {
    return await this.prisma.file.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.FileFindUniqueOrThrowArgs
  ): Promise<File> {
    return await this.prisma.file.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.FileFindManyArgs): Promise<File[]> {
    return await this.prisma.file.findMany(params);
  }

  async create(params: Prisma.FileCreateArgs): Promise<File> {
    return await this.prisma.file.create(params);
  }

  async update(params: Prisma.FileUpdateArgs): Promise<File> {
    return await this.prisma.file.update(params);
  }

  async delete(params: Prisma.FileDeleteArgs): Promise<File> {
    return await this.prisma.file.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.file.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  read(file: File): StreamableFile {
    const stream = createReadStream(
      join(getFileManagementConfig().server_path, file.name)
    );
    return new StreamableFile(stream);
  }

  /* End */
}
