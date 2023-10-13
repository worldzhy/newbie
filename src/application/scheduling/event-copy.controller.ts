import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiQuery} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainerStatus,
  EventContainerOrigin,
} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {generateMonthlyCalendar} from '@toolkit/utilities/datetime.util';
import {RawDataService} from '../raw-data/raw-data.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCopyController {
  constructor(
    private readonly eventContainerService: EventContainerService,
    private readonly eventService: EventService,
    private readonly rawDataService: RawDataService
  ) {}

  @Get(':eventContainerId/import')
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  async importEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    // [step 1] Get target container.
    const targetContainer = await this.eventContainerService.findUniqueOrThrow({
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
      await this.rawDataService.syncScheduling({
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
      throw new BadRequestException('The history data we need is not existed.');
    }

    // [step 3] Generate events.
    const targetEvents: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    const weeksOfTargetContainer = generateMonthlyCalendar(
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

    // [step 4] Create events.
    await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {
          deleteMany: {containerId: eventContainerId},
          create: targetEvents,
        },
      },
    });
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
