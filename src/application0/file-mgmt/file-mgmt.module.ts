import {Module} from '@nestjs/common';
import {GoogleDriveController} from './google-drive.controller';

@Module({
  controllers: [GoogleDriveController],
})
export class App0FileManagementModule {}
