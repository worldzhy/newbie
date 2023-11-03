import {Global, Module} from '@nestjs/common';
import {GoogleFormService} from './google-form.service';

@Global()
@Module({
  providers: [GoogleFormService],
  exports: [GoogleFormService],
})
export class GoogleFormModule {}
