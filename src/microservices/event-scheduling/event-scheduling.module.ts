import {Global, Module} from '@nestjs/common';
import {AvailabilityExpressionService} from './availability-expression.service';
import {AvailabilityTimeslotService} from './availability-timeslot.service';
import {EventService} from './event.service';
import {EventIssueService} from './event-issue.service';
import {EventTypeService} from './event-type.service';
import {EventVenueService} from './event-venue.service';
import {EventContainerService} from './event-container.service';
import {EventChangeLogService} from './event-change-log.service';
import {ReservationService} from './reservation.service';

@Global()
@Module({
  providers: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventService,
    EventChangeLogService,
    EventIssueService,
    EventTypeService,
    EventVenueService,
    EventContainerService,
    ReservationService,
  ],
  exports: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventService,
    EventChangeLogService,
    EventIssueService,
    EventTypeService,
    EventVenueService,
    EventContainerService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
