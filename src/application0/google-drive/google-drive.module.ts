import {Module} from '@nestjs/common';
import {GoogleDriveController} from './google-drive.controller';
import {GoogleSheetController} from './google-sheet.controller';

@Module({
  controllers: [GoogleDriveController, GoogleSheetController],
})
export class App0GoogleDriveModule {}
