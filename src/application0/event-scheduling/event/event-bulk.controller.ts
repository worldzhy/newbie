/* eslint-disable @typescript-eslint/no-explicit-any */
import {Controller, Body, BadRequestException, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, EventStatus, EventContainerStatus} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import * as _ from 'lodash';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {datePlusMinutes, daysOfMonth} from '@toolkit/utilities/datetime.util';

@ApiTags('Event Scheduling / Event Bulk Operations')
@ApiBearerAuth()
@Controller('events')
export class EventBulkOperationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService
  ) {}

  @Post('import/months')
  async getImportList(@Body() body: {eventContainerId: number}) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: body.eventContainerId},
      select: {venueId: true},
    });
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const result: {year: number; month: number}[] = [];

    for (let i = 0; i < 12; i++) {
      let year = currentYear;
      let month = currentMonth - i;
      if (month <= 0) {
        month += 12;
        year = year - 1;
      }

      result.push({year, month});
      const count = await this.prisma.eventContainer.count({
        where: {
          venueId: container.venueId,
          year,
          month,
          status: EventContainerStatus.PUBLISHED,
        },
      });
      if (count > 0) {
        result.push({year, month});
      }
    }

    return result;
  }

  @Post('import')
  async importEventContainer(
    @Body()
    body: {
      eventContainerId: number;
      year: number;
      month: number;
      weekOfMonth: number;
    }
  ) {
    let fromMonth = body.month;
    let fromYear = body.year;
    const fromWeek = body.weekOfMonth ? body.weekOfMonth : 2;
    // [step 1] Get target container.
    const targetContainer = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: body.eventContainerId},
    });
    if (targetContainer.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Get the source container we want to copy its events.
    const sourceContainer = await this.prisma.eventContainer.findFirst({
      where: {
        year: fromYear,
        month: fromMonth,
        venueId: targetContainer.venueId,
        status: EventContainerStatus.PUBLISHED,
      },
      include: {
        events: {where: {status: EventStatus.PUBLISHED, deletedAt: null}},
      },
    });
    if (!sourceContainer || sourceContainer.events.length <= 0) {
      throw new BadRequestException(
        'There are no history schedules for the month.'
      );
    }

    // [step 3] Generate events for target container.
    const targetEvents: Prisma.EventCreateManyInput[] = [];

    const weeksOfTargetContainer = daysOfMonth(
      targetContainer.year,
      targetContainer.month
    );

    for (let i = 0; i < weeksOfTargetContainer.length; i++) {
      if (weeksOfTargetContainer[i].length === 0) {
        continue;
      }

      targetEvents.push(
        ...this.eventService
          .copyMany({
            events: sourceContainer.events,
            from: {
              year: fromYear,
              month: fromMonth,
              week: fromWeek, // The first week may be a semi week but the 2nd week must be a full week.
            },
            to: {
              year: targetContainer.year,
              month: targetContainer.month,
              week: i + 1,
            },
          })
          .map(event => {
            event.containerId = body.eventContainerId;
            return event;
          })
      );
    }

    // [step 4] Delete old events and create new events.
    await this.prisma.event.deleteMany({
      where: {
        containerId: body.eventContainerId,
        status: EventStatus.EDITING,
      },
    });
    await this.prisma.event.createMany({data: targetEvents});
  }

  @Post('bulk-copy')
  @ApiBody({
    description: 'The week number is from 1 to 6',
    examples: {
      a: {
        summary: '1. Overwrite',
        value: {
          eventContainerId: 1,
          fromWeekNumber: 1,
          toWeekNumbers: [2, 3],
        },
      },
    },
  })
  async bulkCopy(
    @Body()
    body: {
      eventContainerId: number;
      fromWeekNumber: number;
      toWeekNumbers: number[];
    }
  ) {
    const {fromWeekNumber, toWeekNumbers} = body;

    // [step 1] Get the container.
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: body.eventContainerId},
      include: {events: true},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    if (container.events.length === 0) {
      return;
    }

    // [step 2] Generate events.
    const newEvents: Prisma.EventCreateManyInput[] = [];
    let targetWeeksOldEventIds: number[] = [];
    for (let i = 0; i < toWeekNumbers.length; i++) {
      // Collect target weeks new events.
      newEvents.push(
        ...this.eventService
          .copyMany({
            events: container.events,
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
          .map(event => {
            event.containerId = body.eventContainerId;
            return event;
          })
      );

      // Collect target weeks old event ids.
      const oldEventIds = container.events
        .filter(event => {
          return event.weekOfMonth === toWeekNumbers[i];
        })
        .map(event => {
          return event.id;
        });
      targetWeeksOldEventIds = _.concat(targetWeeksOldEventIds, oldEventIds);
    }

    // [step 3] Delete events in target weeks.
    await this.prisma.event.deleteMany({
      where: {id: {in: targetWeeksOldEventIds}},
    });

    // [step 4] Create new events.
    await this.prisma.event.createMany({data: newEvents});
  }

  @Post('bulk-move')
  @ApiBody({
    description: 'Bulk move events in the container.',
    examples: {
      a: {
        summary: '1. Move forward',
        value: {eventContainerId: 1, minutesOfMove: 15},
      },
      b: {
        summary: '1. Move backward',
        value: {eventContainerId: 1, minutesOfMove: -15},
      },
    },
  })
  async bulkMove(
    @Body()
    body: {
      eventContainerId: number;
      minutesOfMove: number;
    }
  ) {
    const events = await this.prisma.event.findMany({
      where: {
        containerId: body.eventContainerId,
        deletedAt: null,
        status: EventStatus.EDITING,
      },
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const newDatetimeOfStart = datePlusMinutes(
        event.datetimeOfStart,
        body.minutesOfMove
      );
      const newDatetimeOfEnd = datePlusMinutes(
        event.datetimeOfEnd,
        body.minutesOfMove
      );

      await this.prisma.event.update({
        where: {id: event.id},
        data: {
          datetimeOfStart: newDatetimeOfStart,
          datetimeOfEnd: newDatetimeOfEnd,
          timeZone: event.timeZone,
        },
      });
    }
  }

  @Post('bulk-publish')
  async publishEventContainer(@Body() body: {eventContainerId: number}) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: body.eventContainerId},
      include: {events: true},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('This schedule has been published.');
    }

    if (container.events.length === 0) {
      throw new BadRequestException('There are no classes to publish.');
    }

    return await this.prisma.eventContainer.update({
      where: {id: body.eventContainerId},
      data: {status: EventContainerStatus.PUBLISHED},
    });
  }

  /* End */
}
