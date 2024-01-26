import {Global, Module} from '@nestjs/common';
import {GoogleDriveService} from './google-drive.service';
import {GoogleFormsService} from './google-forms.service';
import {GoogleSheetsService} from './google-sheets.service';
import {GoogleTimezoneService} from './google-timezone.service';

@Global()
@Module({
  providers: [
    GoogleDriveService,
    GoogleFormsService,
    GoogleSheetsService,
    GoogleTimezoneService,
  ],
  exports: [
    GoogleDriveService,
    GoogleFormsService,
    GoogleSheetsService,
    GoogleTimezoneService,
  ],
})
export class GoogleAPIsModule {}
