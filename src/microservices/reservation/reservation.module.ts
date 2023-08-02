import {Global, Module} from '@nestjs/common';
import {AvailabilityProviderService} from './availability-provider.service';
import {AvailabilityRoomService} from './availability-room.service';
import {AvailabilityPeriodService} from './availability-period.service';
import {ReservationService} from './reservation.service';

@Global()
@Module({
  providers: [
    AvailabilityProviderService,
    AvailabilityRoomService,
    AvailabilityPeriodService,
    ReservationService,
  ],
  exports: [
    AvailabilityProviderService,
    AvailabilityRoomService,
    AvailabilityPeriodService,
    ReservationService,
  ],
})
export class ReservationModule {}
