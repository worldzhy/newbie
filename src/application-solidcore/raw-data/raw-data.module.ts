import {Module} from '@nestjs/common';
import {RawDataCoachService} from './raw-data-coach.service';
import {RawDataLocationService} from './raw-data-location.service';
import {RawDataSchedulingService} from './raw-data-scheduling.service';
import {RawDataForecastService} from './raw-data-forecast.service';

@Module({
  providers: [
    RawDataCoachService,
    RawDataLocationService,
    RawDataSchedulingService,
    RawDataForecastService,
  ],
  exports: [
    RawDataCoachService,
    RawDataLocationService,
    RawDataSchedulingService,
    RawDataForecastService,
  ],
})
export class RawDataModule {}
