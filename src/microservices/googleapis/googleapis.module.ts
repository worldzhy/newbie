import {Global, Module} from '@nestjs/common';
import {GoogleFormsService} from './google-forms.service';
import {GoogleTimezoneService} from './google-timezone.service';

@Global()
@Module({
  providers: [GoogleFormsService, GoogleTimezoneService],
  exports: [GoogleFormsService, GoogleTimezoneService],
})
export class GoogleAPIsModule {}
