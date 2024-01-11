import {Global, Module} from '@nestjs/common';
import {AvailabilityService} from './availability.service';
import {EventService} from './event.service';
import {EventIssueService} from './event-issue.service';
import {ReservationService} from './reservation.service';

@Global()
@Module({
  providers: [
    AvailabilityService,
    EventService,
    EventIssueService,
    ReservationService,
  ],
  exports: [
    AvailabilityService,
    EventService,
    EventIssueService,
    ReservationService,
  ],
})
export class EventSchedulingModule {}
