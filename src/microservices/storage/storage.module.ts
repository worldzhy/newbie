import {Global, Module} from '@nestjs/common';
import {LocalDriveService} from './local/local-drive.service';
import {GoogleDriveService} from './google-drive/google-drive.service';
import {GoogleDrivePermissionService} from './google-drive/google-drive-permission.service';
import {S3Service} from './s3/s3.service';

@Global()
@Module({
  providers: [
    LocalDriveService,
    GoogleDriveService,
    GoogleDrivePermissionService,
    S3Service,
  ],
  exports: [
    LocalDriveService,
    GoogleDriveService,
    GoogleDrivePermissionService,
    S3Service,
  ],
})
export class StorageModule {}
