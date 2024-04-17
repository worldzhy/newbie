import {Injectable, StreamableFile} from '@nestjs/common';
import {Express} from 'express';
import {createReadStream} from 'fs';
import {PrismaService} from '@toolkit/prisma/prisma.service';

/**
 * Note: In this service, assume "files" means both files and folders.
 * Folders are files that only contain metadata and can be used to organize files in Drive.
 */
@Injectable()
export class LocalDriveService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolder(params: {name: string; parentId?: string}) {
    return await this.prisma.localFile.create({
      data: {
        name: params.name,
        type: 'Folder',
        parentId: params.parentId,
      },
    });
  }

  async uploadFile(params: {file: Express.Multer.File; parentId?: string}) {
    return await this.prisma.localFile.create({
      data: {
        name: params.file.filename,
        originalName: params.file.originalname,
        type: params.file.mimetype,
        size: params.file.size,
        parentId: params.parentId,
      },
    });
  }

  /**
   * Remove directories and their contents recursively
   */
  async deleteFileRecursively(fileId: string) {
    // [step 1] Delete file.
    await this.prisma.localFile.delete({where: {id: fileId}});

    // [step 2] Delete files in the folder.
    const filesInFolder = await this.prisma.localFile.findMany({
      where: {parentId: fileId},
      select: {id: true},
    });

    for (let i = 0; i < filesInFolder.length; i++) {
      await this.deleteFileRecursively(filesInFolder[i].id);
    }
  }

  async renameFile(params: {fileId: string; name: string}) {
    return await this.prisma.localFile.update({
      where: {id: params.fileId},
      data: {name: params.name},
    });
  }

  async downloadFile(fileId: string) {
    // [step 1] Get the file information.
    const file = await this.prisma.localFile.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Return file.
    try {
      const path = (await this.getFilePathString(fileId)) + '/' + file.name;
      const stream = createReadStream(path);
      return new StreamableFile(stream);
    } catch (error) {
      throw error;
    }
  }

  async getFilePath(fileId: string) {
    const path: object[] = [];

    // [step 1] Get current file.
    const file = await this.prisma.localFile.findFirstOrThrow({
      where: {id: fileId},
      select: {id: true, name: true, type: true, parentId: true},
    });
    path.push(file);

    // [step 2] Get parent file.
    if (file.parentId) {
      path.push(...(await this.getFilePath(file.parentId)));
    } else {
      // Do nothing.
    }

    return path;
  }

  private async getFilePathString(fileId: string) {
    let path = '';

    // [step 1] Get current file.
    let file = await this.prisma.localFile.findFirstOrThrow({
      where: {id: fileId},
      select: {id: true, name: true, type: true, parentId: true},
    });
    path = file.name;

    // [step 2] Get parent file.
    if (file.parentId) {
      path = (await this.getFilePathString(file.parentId)) + '/' + path;
    } else {
      // Do nothing.
    }

    return path;
  }

  /* End */
}
