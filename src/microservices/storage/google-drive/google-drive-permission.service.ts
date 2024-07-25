import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/drive';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleAccountRole} from './google-drive.enum';

/**
 * Note: In this service, assume "files" means both files and folders.
 * Folders are files that only contain metadata and can be used to organize files in Drive.
 */
@Injectable()
export class GoogleDrivePermissionService {
  private drive: google.drive_v3.Drive;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    const auth = new google.auth.GoogleAuth({
      keyFile: this.config.getOrThrow<string>(
        'microservices.storage.googleapis.credentials.serviceAccount'
      ),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({version: 'v3', auth: auth});
  }

  async createPermission(params: {
    fileId: string;
    email: string;
    role: GoogleAccountRole;
  }) {
    try {
      const response = await this.drive.permissions.create({
        fileId: params.fileId,
        sendNotificationEmail: true,
        requestBody: {
          type: 'user',
          emailAddress: params.email,
          role: params.role,
        },
      });

      return await this.prisma.googleFilePermission.create({
        data: {
          permissionId: response.data.id!,
          type: 'user',
          role: params.role,
          email: params.email,
          fileId: params.fileId,
        },
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async deletePermission(id: number) {
    try {
      const permission = await this.prisma.googleFilePermission.delete({
        where: {id},
      });

      await this.drive.permissions.delete({
        fileId: permission.fileId,
        permissionId: permission.permissionId,
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async listPermissions(params: {fileId: string}) {
    try {
      const response = await this.drive.permissions.list({
        fileId: params.fileId,
      });

      const permissions = response.data.permissions;
      if (permissions === undefined) {
        return [];
      }

      return Promise.all(
        permissions.map(async permission => {
          return await this.drive.permissions.get({
            fileId: params.fileId,
            permissionId: permission.id!,
          });
        })
      );
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  /* End */
}
