import {Global, Module} from '@nestjs/common';
import {GoogleDriveService} from './drive/drive.service';
import {GoogleFormService} from './drive/form.service';
import {GoogleSheetService} from './drive/sheet.service';
import {GoogleTimezoneService} from './timezone/timezone.service';

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
export class GoogleAPIsModule {}
