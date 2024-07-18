import {Global, Module} from '@nestjs/common';
import {GoogleFormService} from './google-form.service';
import {GoogleSheetService} from './google-sheet.service';
import {GoogleTimezoneService} from './google-timezone.service';

@Global()
@Module({
  providers: [GoogleFormService, GoogleSheetService, GoogleTimezoneService],
  exports: [GoogleFormService, GoogleSheetService, GoogleTimezoneService],
})
export class GoogleAPIsModule {}
