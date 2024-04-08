import {Global, Module} from '@nestjs/common';
import {GoogleDriveService} from './google-drive.service';
import {GoogleDrivePermissionService} from './google-drive-permission.service';
import {GoogleFormService} from './google-form.service';
import {GoogleSheetService} from './google-sheet.service';
import {GoogleTimezoneService} from './google-timezone.service';

@Global()
@Module({
  providers: [
    GoogleDriveService,
    GoogleDrivePermissionService,
    GoogleFormService,
    GoogleSheetService,
    GoogleTimezoneService,
  ],
  exports: [
    GoogleDriveService,
    GoogleDrivePermissionService,
    GoogleFormService,
    GoogleSheetService,
    GoogleTimezoneService,
  ],
})
export class GoogleSaaSModule {}
