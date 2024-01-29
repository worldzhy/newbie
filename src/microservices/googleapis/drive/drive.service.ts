import * as google from '@googleapis/drive';
import {GoogleAccountRole, GoogleMimeType} from '../enum';
import {GoogleApisService} from '../googleapis.service';
import {ConfigService} from '@nestjs/config';

export abstract class GoogleDriveService extends GoogleApisService {
  private drive: google.drive_v3.Drive;

  constructor(
    private readonly config: ConfigService,
    private readonly mimeType: GoogleMimeType
  ) {
    super(config);
    this.drive = google.drive({version: 'v3', auth: this.auth});
  }

  async share(params: {
    fileId: string;
    gmail: string;
    role: GoogleAccountRole;
  }) {
    const permission = await this.drive.permissions.create({
      fileId: params.fileId,
      sendNotificationEmail: true,
      requestBody: {
        type: 'user',
        emailAddress: params.gmail,
        role: params.role,
      },
    });

    return permission.data;
  }

  async createFolder(params: {name: string; parentFolderId?: string}) {
    try {
      const folder = await this.drive.files.create({
        requestBody: {
          mimeType: 'application/vnd.google-apps.folder',
          name: params.name,
          parents: params.parentFolderId ? [params.parentFolderId] : undefined,
        },
      });

      return folder.data;
    } catch (err) {
      return err;
    }
  }

  protected async createFile(params: {name: string; folderId: string}) {
    try {
      const file = await this.drive.files.create({
        requestBody: {
          mimeType: this.mimeType,
          name: params.name,
          parents: [params.folderId],
        },
      });
      return file.data;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  /* End */
}
