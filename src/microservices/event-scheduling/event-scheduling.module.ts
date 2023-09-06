import {Global, Module} from '@nestjs/common';
import {AvailabilityExpressionService} from './availability-expression.service';
import {AvailabilityTimeslotService} from './availability-timeslot.service';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';
import {EventVenueService} from './event-venue.service';
import {HeatmapService} from './heatmap.service';

@Global()
@Module({
  providers: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventCalendarService,
    EventContainerService,
    EventTypeService,
    EventVenueService,
    EventService,
    HeatmapService,
    ReservationService,
  ],
  exports: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventCalendarService,
    EventContainerService,
    EventTypeService,
    EventVenueService,
    EventService,
    HeatmapService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
