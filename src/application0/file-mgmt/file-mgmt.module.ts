import {Module} from '@nestjs/common';
import {GoogleDriveController} from './google-drive.controller';
import {GoogleSheetController} from './google-sheet.controller';
import {S3DriveController} from './s3-drive.controller';
import {LocalDriveController} from './local-drive.controller';

@Module({
  controllers: [
    GoogleDriveController,
    GoogleSheetController,
    S3DriveController,
    LocalDriveController,
  ],
})
export class App0FileManagementModule {}
