import {Global, Module} from '@nestjs/common';
import {EventService} from './event.service';
import {AvailabilityContainerService} from './availability-container.service';
import {AvailabilityService} from './availability.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';

@Global()
@Module({
  providers: [
    EventService,
    AvailabilityContainerService,
    AvailabilityService,
    ReservationService,
    EventCalendarService,
  ],
  exports: [
    EventService,
    AvailabilityContainerService,
    AvailabilityService,
    ReservationService,
    EventCalendarService,
  ],
})
export class ReservationModule {}
