import {Global, Module} from '@nestjs/common';
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
    EventCalendarService,
    EventContainerService,
    EventTypeService,
    EventVenueService,
    EventService,
    HeatmapService,
    ReservationService,
  ],
  exports: [
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
