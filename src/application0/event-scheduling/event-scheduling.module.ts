import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability/availability-expression.controller';
import {AvailabilityHeatmapController} from './availability/availability-heatmap.controller';
import {EventChangeLogController} from './event/event-changelog.controller';
import {EventController} from './event/event.controller';
import {EventCopyController} from './event/event-copy.controller';
import {EventContainerController} from './event/event-container.controller';
import {EventHostController} from './event-host/event-host.controller';
import {EventTypeController} from './event-type/event-type.controller';
import {EventVenueController} from './event-venue/event-venue.controller';

@Module({
  controllers: [
    AvailabilityExpressionController,
    AvailabilityHeatmapController,
    EventChangeLogController,
    EventContainerController,
    EventCopyController,
    EventController,
    EventHostController,
    EventTypeController,
    EventVenueController,
  ],
})
export class App0EventSchedulingModule {}
