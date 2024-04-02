import {Global, Module} from '@nestjs/common';
import {GoogleDriveService} from './google-drive.service';
import {GoogleFormService} from './google-form.service';
import {GoogleSheetService} from './google-sheet.service';
import {GoogleTimezoneService} from './google-timezone.service';

@Global()
@Module({
  providers: [
    GoogleDriveService,
    GoogleFormService,
    GoogleSheetService,
    GoogleTimezoneService,
  ],
  exports: [
    GoogleDriveService,
    GoogleFormService,
    GoogleSheetService,
    GoogleTimezoneService,
  ],
})
export class GoogleSaaSModule {}
