import * as google from '@googleapis/drive';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleApisService} from '../googleapis.service';
import {GoogleAccountRole, GoogleFileType, GoogleMimeType} from '../enum';
import {InternalServerErrorException} from '@nestjs/common';

export abstract class GoogleDriveService extends GoogleApisService {
  private drive: google.drive_v3.Drive;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly fileType: GoogleFileType
  ) {
    super(config);
    this.drive = google.drive({version: 'v3', auth: this.auth});
  }

  async share(params: {
    fileId: string;
    gmail: string;
    role: GoogleAccountRole;
  }) {
    try {
      return await this.drive.permissions.create({
        fileId: params.fileId,
        sendNotificationEmail: true,
        requestBody: {
          type: 'user',
          emailAddress: params.gmail,
          role: params.role,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(name: string) {
    return await this.prisma.googleFile.findFirst({where: {name}});
  }

  async findMany(name: string) {
    return await this.prisma.googleFile.findMany({where: {name}});
  }

  async createFolder(params: {name: string; parentId?: string}) {
    try {
      return await this.newFile({
        name: params.name,
        type: GoogleFileType.Folder,
        parentId: params.parentId,
      });
    } catch (err) {
      return err;
    }
  }

  protected async createFile(params: {name: string; parentId?: string}) {
    return await this.newFile({
      name: params.name,
      type: this.fileType,
      parentId: params.parentId,
    });
  }

  protected async delete(fileId: string) {
    try {
      await this.drive.files.delete({fileId});
      return await this.prisma.googleFile.delete({
        where: {id: fileId},
      });
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  private async newFile(params: {
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

      if (file.data.id) {
        return await this.prisma.googleFile.create({
          data: {
            id: file.data.id,
            name: params.name,
            type: params.type,
            parentId: params.parentId,
          },
        });
      } else {
        throw new InternalServerErrorException('Create google file failed.');
      }
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  /* End */
}
