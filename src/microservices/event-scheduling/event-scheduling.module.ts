import {Global, Module} from '@nestjs/common';
import {AvailabilityService} from './availability.service';
import {EventService} from './event.service';
import {EventIssueService} from './event-issue.service';

@Global()
@Module({
  providers: [AvailabilityService, EventService, EventIssueService],
  exports: [AvailabilityService, EventService, EventIssueService],
})
export class EventSchedulingModule {}
