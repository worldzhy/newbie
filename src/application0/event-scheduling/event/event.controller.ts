import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Get,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventChangeLogType,
  EventIssueStatus,
  EventStatus,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {
  constructDateTime,
  datePlusMinutes,
  sameWeekdaysOfMonth,
} from '@toolkit/utilities/datetime.util';
import * as _ from 'lodash';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          datetimeOfStart: '2023-11-28 17:40:05.025 +0800',
          typeId: 1,
          venueId: 1,
          containerId: 1,
          needToDuplicate: true,
        },
      },
    },
  })
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    if (!body.hostUserId) {
      throw new BadRequestException('hostUserId is required.');
    }

    // [step 1] Create event.
    const eventType = await this.prisma.eventType.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;

    const {needToDuplicate} = body;

    delete body.needToDuplicate;
    const event = await this.prisma.event.create({
      data: body,
      include: {type: true},
    });

    // [step 2] Note add event.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'New class: ' + eventType.name + ' at ' + body.datetimeOfStart,
        eventContainerId: body.containerId,
        eventId: event.id,
      },
    });

    // [step 3] Check event issues.
    await this.eventIssueService.check(event);

    // [step 4] Attach information.
    event['issues'] = await this.prisma.eventIssue.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: event.id},
    });
    event['hostUser'] = await this.prisma.userSingleProfile.findUniqueOrThrow({
      where: {userId: body.hostUserId},
      select: {userId: true, fullName: true, eventHostTitle: true},
    });

    // [step 5] Duplicate events.
    if (needToDuplicate) {
      const sameWeekdays = sameWeekdaysOfMonth(
        event.year,
        event.month,
        event.dayOfMonth
      );
      for (let i = 0; i < sameWeekdays.length; i++) {
        const sameWeekDay = sameWeekdays[i];
        if (sameWeekDay.dayOfMonth === event.dayOfMonth) {
          continue;
        }

        const newDatetimeOfStart = constructDateTime(
          sameWeekDay.year,
          sameWeekDay.month,
          sameWeekDay.dayOfMonth,
          event.hour,
          event.minute,
          0,
          event.timeZone
        );
        const newDatetimeOfEnd = datePlusMinutes(
          newDatetimeOfStart,
          eventType.minutesOfDuration
        );

        // Check if there is another event around this period.
        if (
          (await this.prisma.event.count({
            where: {
              containerId: body.containerId,
              datetimeOfStart: {lt: newDatetimeOfEnd},
              datetimeOfEnd: {gt: newDatetimeOfStart},
            },
          })) > 0
        ) {
          continue;
        }

        const newOtherEvent = await this.prisma.event.create({
          data: {
            hostUserId: event.hostUserId,
            datetimeOfStart: newDatetimeOfStart,
            minutesOfDuration: event.minutesOfDuration,
            timeZone: event.timeZone,
            typeId: event.typeId,
            venueId: event.venueId,
            containerId: event.containerId,
          } as Prisma.EventUncheckedCreateInput,
        });

        // Note the update.
        await this.prisma.eventChangeLog.create({
          data: {
            type: EventChangeLogType.USER,
            description:
              'New class: ' +
              eventType.name +
              ' at ' +
              newOtherEvent.datetimeOfStart,
            eventContainerId: newOtherEvent.containerId,
            eventId: newOtherEvent.id,
          },
        });
      }
    }

    return event;
  }

  @Get('')
  async getEvents(
    @Query('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    const events = await this.prisma.event.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
        deletedAt: null,
      },
      include: {type: true},
    });

    // Get all the coaches information
    const coachIds = events
      .map(event => {
        return event.hostUserId;
      })
      .filter(coachId => coachId !== null) as string[];
    const coachProfiles = await this.prisma.userSingleProfile.findMany({
      where: {userId: {in: coachIds}},
      select: {userId: true, fullName: true, eventHostTitle: true},
    });
    const coachProfilesMapping = coachProfiles.reduce(
      (obj, item) => ({
        ...obj,
        [item.userId]: item,
      }),
      {}
    );

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Attach coach information
      if (event.hostUserId) {
        event['hostUser'] = coachProfilesMapping[event.hostUserId];
      } else {
        event['hostUser'] = {};
      }
    }

    return events;
  }

  @Patch(':eventId')
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the event.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          datetimeOfStart: '2023-11-28 17:40:05.025 +0800',
          typeId: 1,
          venueId: 1,
          containerId: 1,
          needToDuplicate: true,
        },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUncheckedUpdateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    return this.eventService.updateEvent(eventId, body);
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    // [step 1] Get the event.
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 2] Delete the event.
    await this.prisma.event.delete({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 3] Note the deletion.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'Remove class: ' +
          event['type'].name +
          ' at ' +
          event.datetimeOfStart,
        eventContainerId: event.containerId,
        eventId: eventId,
      },
    });

    return event;
  }

  @Patch(':eventId/publish')
  async publishEvent(@Param('eventId') eventId: number) {
    return await this.prisma.event.update({
      where: {id: eventId},
      data: {status: EventStatus.PUBLISHED},
    });
  }

  /* End */
}
