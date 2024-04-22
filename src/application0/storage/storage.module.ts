import {Module} from '@nestjs/common';
import {ManagedGoogleDriveController} from './managed-google-drive.controller';
import {ManagedS3Controller} from './managed-s3.controller';
import {LocalDriveController} from './local.controller';
import {MountedS3Controller} from './mounted-s3.controller';

@Module({
  controllers: [
    ManagedGoogleDriveController,
    ManagedS3Controller,
    MountedS3Controller,
    LocalDriveController,
  ],
})
export class App0StorageModule {}
