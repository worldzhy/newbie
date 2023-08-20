import {Global, Module} from '@nestjs/common';
import {EventTypeService} from './event-type.service';
import {EventContainerService} from './event-container.service';
import {EventService} from './event.service';
import {ReservationService} from './reservation.service';
import {EventCalendarService} from './event-calendar.service';
import {SpaceService} from './space.service';

@Global()
@Module({
  providers: [
    SpaceService,
    EventTypeService,
    EventContainerService,
    EventService,
    ReservationService,
    EventCalendarService,
  ],
  exports: [
    SpaceService,
    EventTypeService,
    EventContainerService,
    EventService,
    ReservationService,
    EventCalendarService,
  ],
})
export class EventCalendarModule {}
