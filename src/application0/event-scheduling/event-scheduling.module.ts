import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability/availability-expression.controller';
import {AvailabilityHeatmapController} from './availability/availability-heatmap.controller';
import {EventBulkOperationController} from './event/event-bulk.controller';
import {EventChangeLogController} from './event/event-changelog.controller';
import {EventController} from './event/event.controller';
import {EventContainerController} from './event/event-container.controller';
import {EventHostController} from './host/event-host.controller';
import {EventIssueController} from './event/event-issue.controller';
import {EventTypeController} from './event-type/event-type.controller';
import {EventVenueController} from './venue/event-venue.controller';

@Module({
  controllers: [
    AvailabilityExpressionController,
    AvailabilityHeatmapController,
    EventBulkOperationController,
    EventChangeLogController,
    EventContainerController,
    EventController,
    EventHostController,
    EventIssueController,
    EventTypeController,
    EventVenueController,
  ],
})
export class App0EventSchedulingModule {}
