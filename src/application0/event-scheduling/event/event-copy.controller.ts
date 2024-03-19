/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Patch,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, EventContainerStatus} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import * as _ from 'lodash';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCopyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService
  ) {}

  @Patch(':eventContainerId/copy')
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
  async copyWeeklyEvents(
    @Param('eventContainerId') eventContainerId: number,
    @Body() body: {fromWeekNumber: number; toWeekNumbers: number[]}
  ) {
    const {fromWeekNumber, toWeekNumbers} = body;

    // [step 1] Get the container.
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
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
            event.containerId = eventContainerId;
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

  /* End */
}
