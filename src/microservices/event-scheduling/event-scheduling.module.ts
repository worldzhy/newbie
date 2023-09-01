import {Global, Module} from '@nestjs/common';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';
import {EventLocationService} from './event-location.service';
import {HeatmapService} from './heatmap.service';
import {TagService} from './tag.service';

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
    TagService,
  ],
  exports: [
    EventCalendarService,
    EventContainerService,
    EventLocationService,
    EventTypeService,
    EventService,
    HeatmapService,
    ReservationService,
    TagService,
  ],
})
export class EventSchedulingModule {}
