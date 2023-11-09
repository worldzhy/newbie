import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability-expression.controller';
import {FetchGoogleFormController} from './fetch-google-form.controller';
import {LoadXlsxFileController} from './load-xlsx-file.controller';
import {FetchGoogleFormService} from './fetch-google-form.service';

@Module({
  controllers: [
    AvailabilityExpressionController,
    FetchGoogleFormController,
    LoadXlsxFileController,
  ],
  providers: [FetchGoogleFormService],
  exports: [FetchGoogleFormService],
})
export class AvailabilityModule {}
