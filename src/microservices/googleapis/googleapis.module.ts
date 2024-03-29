import {Global, Module} from '@nestjs/common';
import {GoogleDriveService} from './drive/drive.service';
import {GoogleFormService} from './form/form.service';
import {GoogleSheetService} from './sheet/sheet.service';
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
