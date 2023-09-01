import {Global, Module} from '@nestjs/common';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';
import {EventLocationService} from './event-location.service';
import {HeatmapService} from './heatmap.service';

@Global()
@Module({
  providers: [
    EventCalendarService,
    EventContainerService,
    EventLocationService,
    EventTypeService,
    EventService,
    HeatmapService,
    ReservationService,
  ],
  exports: [
    EventCalendarService,
    EventContainerService,
    EventLocationService,
    EventTypeService,
    EventService,
    HeatmapService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
