import {Global, Module} from '@nestjs/common';
import {GoogleFormService} from './drive/form.service';
import {GoogleSheetService} from './drive/sheet.service';
import {GoogleTimezoneService} from './timezone/timezone.service';

@Global()
@Module({
  providers: [GoogleFormService, GoogleSheetService, GoogleTimezoneService],
  exports: [GoogleFormService, GoogleSheetService, GoogleTimezoneService],
})
export class GoogleAPIsModule {}
