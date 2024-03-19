import {Global, Module} from '@nestjs/common';
import {AvailabilityService} from './availability.service';
import {EventService} from './event.service';
import {EventHostService} from './event-host.service';
import {EventIssueService} from './event-issue.service';

@Global()
@Module({
  providers: [
    AvailabilityService,
    EventService,
    EventHostService,
    EventIssueService,
  ],
  exports: [
    AvailabilityService,
    EventService,
    EventHostService,
    EventIssueService,
  ],
})
export class EventSchedulingModule {}
