import {Global, Module} from '@nestjs/common';
import {AvailabilityExpressionService} from './availability-expression.service';
import {AvailabilityTimeslotService} from './availability-timeslot.service';
import {EventService} from './event.service';
import {EventIssueService} from './event-issue.service';
import {EventTypeService} from './event-type.service';
import {ReservationService} from './reservation.service';

@Global()
@Module({
  providers: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventService,
    EventIssueService,
    EventTypeService,
    ReservationService,
  ],
  exports: [
    AvailabilityExpressionService,
    AvailabilityTimeslotService,
    EventService,
    EventIssueService,
    EventTypeService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
