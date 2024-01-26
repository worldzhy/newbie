import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/drive';
import {ConfigService} from '@nestjs/config';

export enum GoogleMimeType {
  //https://developers.google.com/drive/api/guides/mime-types
  Folder = 'application/vnd.google-apps.folder',
  Doc = 'application/vnd.google-apps.document',
  Sheet = 'application/vnd.google-apps.spreadsheet',
  Form = 'application/vnd.google-apps.form',
  Slide = 'application/vnd.google-apps.presentation',
}

export enum GoogleDriveRole {
  Writer = 'writer',
  Commenter = 'commenter',
  Reader = 'reader',
}

@Injectable()
export class GoogleDriveService {
  private auth;

  constructor(private readonly configService: ConfigService) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    this.auth = new google.auth.GoogleAuth({
      keyFile: configService.getOrThrow<string>(
        'microservice.googleapis.credentials.serviceAccount'
      ),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }

  async share(params: {fileId: string; gmail: string; role: GoogleDriveRole}) {
    const drive = google.drive({version: 'v3', auth: this.auth});

    const permission = await drive.permissions.create({
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
    const drive = google.drive({version: 'v3', auth: this.auth});
    try {
      const folder = await drive.files.create({
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

  async createFile(params: {
    type: GoogleMimeType;
    name: string;
    folderId: string;
  }) {
    const drive = google.drive({version: 'v3', auth: this.auth});
    try {
      const file = await drive.files.create({
        requestBody: {
          mimeType: params.type,
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
