import {Global, Module} from '@nestjs/common';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';
import {SpaceService} from './space.service';
import {HeatmapService} from './heatmap.service';

@Global()
@Module({
  providers: [
    EventCalendarService,
    EventContainerService,
    EventTypeService,
    EventService,
    HeatmapService,
    ReservationService,
    SpaceService,
  ],
  exports: [
    EventCalendarService,
    EventContainerService,
    EventTypeService,
    EventService,
    HeatmapService,
    ReservationService,
    SpaceService,
  ],
})
export class EventSchedulingModule {}
