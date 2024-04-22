import {Global, Module} from '@nestjs/common';
import {
  AvailabilityJobProcessor,
  EventSchedulingQueue,
} from './availability.processor';
import {AvailabilityService} from './availability.service';
import {EventService} from './event.service';
import {EventHostService} from './event-host.service';
import {EventIssueService} from './event-issue.service';
import {BullModule} from '@nestjs/bull';

@Global()
@Module({
  imports: [BullModule.registerQueue({name: EventSchedulingQueue})],
  providers: [
    AvailabilityJobProcessor,
    AvailabilityService,
    EventService,
    EventHostService,
    EventIssueService,
  ],
  exports: [
    AvailabilityJobProcessor,
    AvailabilityService,
    EventService,
    EventHostService,
    EventIssueService,
    BullModule.registerQueue({name: EventSchedulingQueue}), // If do not export, there will be an error in App0EventSchedulingModule.
  ],
})
export class EventSchedulingModule {}
