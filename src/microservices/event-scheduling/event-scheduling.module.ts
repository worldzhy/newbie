import {Global, Module} from '@nestjs/common';
import {AvailabilityExpressionService} from './availability-expression.service';
import {AvailabilityTimeslotService} from './availability-timeslot.service';
import {AvailabilityService} from './availability.service';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventVenueService} from './event-venue.service';

@Global()
@Module({
  providers: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    AvailabilityService,
    EventContainerService,
    EventTypeService,
    EventVenueService,
    EventService,
    ReservationService,
  ],
  exports: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    AvailabilityService,
    EventContainerService,
    EventTypeService,
    EventVenueService,
    EventService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
