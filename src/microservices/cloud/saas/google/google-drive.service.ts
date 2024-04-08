import {Injectable, InternalServerErrorException} from '@nestjs/common';
import * as google from '@googleapis/drive';
import {ConfigService} from '@nestjs/config';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleFileBaseURL, GoogleFileType, GoogleMimeType} from './enum';

/**
 * Note: In this service, assume "files" means both files and folders.
 * Folders are files that only contain metadata and can be used to organize files in Drive.
 */
@Injectable()
export class GoogleDriveService {
  private drive: google.drive_v3.Drive;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    const auth = new google.auth.GoogleAuth({
      keyFile: this.config.getOrThrow<string>(
        'microservice.googleapis.credentials.serviceAccount'
      ),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({version: 'v3', auth: auth});
  }

  async uploadFile(size: number) {
    const response = await this.drive.files.create(
      {uploadType: 'resumable'},
      {headers: {'Content-Length': size}}
    );
    console.log(response);
  }

  async getFile(name: string) {
    const file = await this.prisma.googleFile.findFirst({where: {name}});
    if (file) {
      const response = await this.drive.files.get({fileId: file.id});
      console.log(response);
    }

    return file;
  }

  async getFilePath(fileId: string) {
    return await this.getFilePathRecursively(fileId);
  }

  async listFiles(params: {page: number; pageSize: number; parentId?: string}) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoogleFile,
      pagination: {page: params.page, pageSize: params.pageSize},
      findManyArgs: {where: {parentId: params.parentId ?? null}},
    });
  }

  async createFolder(params: {name: string; parentId?: string}) {
    try {
      return await this.createFile({
        name: params.name,
        type: GoogleFileType.Folder,
        parentId: params.parentId,
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async createDocument(params: {name: string; parentId?: string}) {
    try {
      return await this.createFile({
        name: params.name,
        type: GoogleFileType.Document,
        parentId: params.parentId,
      });
    } catch (error) {
      throw error;
    }
  }

  async createSheet(params: {name: string; parentId?: string}) {
    try {
      return await this.createFile({
        name: params.name,
        type: GoogleFileType.Sheet,
        parentId: params.parentId,
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  /**
   * Note: If you're deleting a folder, all descendants owned by the user are also deleted.
   * https://developers.google.com/drive/api/guides/delete
   */
  async deleteFile(fileId: string) {
    try {
      const response = await this.drive.files.delete({fileId});
      if (response.status >= 200 && response.status < 300) {
        await this.deleteFileRecursively(fileId);
      } else {
        throw new InternalServerErrorException('Delete google file failed.');
      }
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async renameFile(params: {fileId: string; name: string}) {
    try {
      const response = await this.drive.files.update({
        fileId: params.fileId,
        requestBody: {name: params.name},
      });
      if (response.status >= 200 && response.status < 300) {
        return await this.prisma.googleFile.update({
          where: {id: params.fileId},
          data: {name: params.name},
        });
      } else {
        throw new InternalServerErrorException('Rename google file failed.');
      }
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  private async createFile(params: {
    name: string;
    type: GoogleFileType;
    parentId?: string;
  }) {
    try {
      const file = await this.drive.files.create({
        requestBody: {
          mimeType: GoogleMimeType[params.type],
          name: params.name,
          parents: params.parentId ? [params.parentId] : undefined,
        },
      });
      if (!file.data.id) {
        throw new InternalServerErrorException('Create google file failed.');
      }

      return await this.prisma.googleFile.create({
        data: {
          id: file.data.id,
          name: params.name,
          type: params.type,
          url: GoogleFileBaseURL[params.type] + file.data.id,
          parentId: params.parentId,
        },
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  /**
   * Remove directories and their contents recursively
   */
  private async deleteFileRecursively(fileId: string) {
    // [step 1] Delete file.
    await this.prisma.googleFile.delete({where: {id: fileId}});

    // [step 2] Delete files in the folder.
    const filesInFolder = await this.prisma.googleFile.findMany({
      where: {parentId: fileId},
      select: {id: true},
    });

    for (let i = 0; i < filesInFolder.length; i++) {
      await this.deleteFileRecursively(filesInFolder[i].id);
    }
  }

  private async getFilePathRecursively(fileId: string) {
    const path: object[] = [];

    // [step 1] Get current file.
    const file = await this.prisma.googleFile.findFirstOrThrow({
      where: {id: fileId},
      select: {id: true, name: true, type: true, parentId: true},
    });
    path.push(file);

    // [step 2] Get parent file.
    if (file.parentId) {
      path.push(...(await this.getFilePathRecursively(file.parentId)));
    } else {
      // Do nothing.
    }

    return path;
  }

  private async listFilesOnCloud(params: {parentId?: string}) {
    // supported syntax - https://developers.google.com/drive/api/guides/search-files
    const q = params.parentId
      ? `'${params.parentId}' in parents`
      : `'root' in parents`;

    try {
      const response = await this.drive.files.list({q});
      return response.data;
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  private async searchFilesOnCloud(params: {name: string}) {
    // supported syntax - https://developers.google.com/drive/api/guides/search-files
    const q = params.name ? `name contains '${params.name}'` : undefined;

    try {
      const response = await this.drive.files.list({q});
      return response.data;
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  /* End */
}
