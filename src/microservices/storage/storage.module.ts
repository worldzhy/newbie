import {Global, Module} from '@nestjs/common';
import {LocalDriveService} from './local/local-drive.service';
import {GoogleDriveService} from './google-drive/google-drive.service';
import {GoogleDrivePermissionService} from './google-drive/google-drive-permission.service';
import {S3DriveService} from './s3/s3-drive.service';

@Global()
@Module({
  providers: [
    LocalDriveService,
    GoogleDriveService,
    GoogleDrivePermissionService,
    S3DriveService,
  ],
  exports: [
    LocalDriveService,
    GoogleDriveService,
    GoogleDrivePermissionService,
    S3DriveService,
  ],
})
export class StorageModule {}
