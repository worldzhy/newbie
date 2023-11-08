import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainerStatus,
  EventContainerOrigin,
} from '@prisma/client';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import {RawDataSchedulingService} from '../raw-data/raw-data-scheduling.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCopyController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventService: EventService,
    private readonly rawDataSchedulingService: RawDataSchedulingService
  ) {}

  @Get(':eventContainerId/import')
  async importEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    // [step 1] Get target container.
    let targetContainer = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    if (targetContainer.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Get the source container we want to copy its events.
    // [step 2-1] Seach the source container in local database.
    let sourceContainer = await this.eventContainerService.findFirst({
      where: {
        year,
        month,
        venueId: targetContainer.venueId,
        status: EventContainerStatus.PUBLISHED,
      },
      include: {events: true},
    });

    // [step 2-2] Fetch origin data and create the source container.
    if (!sourceContainer) {
      await this.rawDataSchedulingService.synchronize({
        venueId: targetContainer.venueId,
        year,
        month,
      });

      sourceContainer = await this.eventContainerService.findFirst({
        where: {
          year,
          month,
          venueId: targetContainer.venueId,
          origin: EventContainerOrigin.EXTERNAL,
          status: EventContainerStatus.PUBLISHED,
        },
        include: {events: true},
      });
    }
    if (!sourceContainer) {
      return;
    }

    // [step 3] Generate events for target container.
    const targetEvents: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    const weeksOfTargetContainer = daysOfMonth(
      targetContainer.year,
      targetContainer.month
    );
    for (let i = 0; i < weeksOfTargetContainer.length; i++) {
      targetEvents.push(
        ...this.eventService.copyMany({
          events: sourceContainer['events'],
          from: {
            year: sourceContainer.year,
            month: sourceContainer.month,
            week: 2, // The first week may be a semi week but the 2nd week must be a full week.
          },
          to: {
            year: targetContainer.year,
            month: targetContainer.month,
            week: i + 1,
          },
        })
      );
    }

    // [step 4] Add events to target container.
    // [step 4-1] Undo coaches' availability checkins.
    const oldEvents = await this.eventService.findMany({
      where: {containerId: eventContainerId},
      select: {
        id: true,
        hostUserId: true,
        datetimeOfStart: true,
        datetimeOfEnd: true,
      },
    });
    for (let j = 0; j < oldEvents.length; j++) {
      const event = oldEvents[j];
      await this.availabilityTimeslotService.undoCheckin(event);
    }

    // [step 4-2] Delete old events and create new events.
    targetContainer = await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {
          deleteMany: {containerId: eventContainerId},
          create: targetEvents,
        },
      },
      select: {events: true},
    });

    // [step 4-3] Checkin coaches' availability.
    for (let j = 0; j < targetContainer['events'].length; j++) {
      const event = targetContainer['events'][j];
      await this.availabilityTimeslotService.checkin(event);
    }
  }

  @Patch(':eventContainerId/overwrite')
  @ApiBody({
    description: 'The week number is from 1 to 6',
    examples: {
      a: {
        summary: '1. Overwrite',
        value: {
          fromWeekNumber: 1,
          toWeekNumbers: [2, 3],
        },
      },
    },
  })
  async overwriteEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Body() body: {fromWeekNumber: number; toWeekNumbers: number[]}
  ) {
    const {fromWeekNumber, toWeekNumbers} = body;

    // [step 1] Get the container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Generate events.
    const events: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    for (let i = 0; i < toWeekNumbers.length; i++) {
      events.push(
        ...this.eventService.copyMany({
          events: container['events'],
          from: {
            year: container.year,
            month: container.month,
            week: fromWeekNumber,
          },
          to: {
            year: container.year,
            month: container.month,
            week: toWeekNumbers[i],
          },
        })
      );
    }

    // [step 3] Create events.
    const reservedEventIds = (container['events'] as Event[]).map(event => {
      return event.id;
    });

    await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {
          deleteMany: {
            containerId: eventContainerId,
            id: {notIn: reservedEventIds},
          },
          create: events,
        },
      },
    });
  }

  /* End */
}
