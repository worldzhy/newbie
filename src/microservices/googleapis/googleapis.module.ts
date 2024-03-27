import {Global, Module} from '@nestjs/common';
import {GoogleFormService} from './drive/form.service';
import {GoogleSpreadsheetService} from './drive/spreadsheet.service';
import {GoogleTimezoneService} from './timezone/timezone.service';

@Global()
@Module({
  providers: [
    GoogleFormService,
    GoogleSpreadsheetService,
    GoogleTimezoneService,
  ],
  exports: [GoogleFormService, GoogleSpreadsheetService, GoogleTimezoneService],
})
export class GoogleAPIsModule {}
