import {Injectable} from '@nestjs/common';
import {
  Prisma,
  Event,
  EventChangeLogType,
  EventIssueStatus,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {constructDateTime, daysOfMonth} from '@toolkit/utilities/datetime.util';
import * as _ from 'lodash';
import {EventIssueService} from './event-issue.service';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventIssueService: EventIssueService
  ) {}

  copyMany(
    params: {
      events: Event[];
      from: {
        year: number;
        month: number;
        week: number; // The number of week in a month, 1~6.
      };
      to: {
        year: number;
        month: number;
        week: number; // The number of week in a month, 1~6.
      };
    },
    options: any = {}
  ) {
    const {datasource} = options;
    const calendarOfSourceContainer = daysOfMonth(
      params.from.year,
      params.from.month
    );
    const calendarOfTargetContainer = daysOfMonth(
      params.to.year,
      params.to.month
    );
    const daysOfSourceWeek = calendarOfSourceContainer[params.from.week - 1];
    const daysOfTargetWeek = calendarOfTargetContainer[params.to.week - 1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetEvents: any[] = [];

    for (let j = 0; j < daysOfTargetWeek.length; j++) {
      const dayOfTargetWeek = daysOfTargetWeek[j];

      for (let m = 0; m < daysOfSourceWeek.length; m++) {
        const dayOfSourceWeek = daysOfSourceWeek[m];
        if (dayOfSourceWeek.dayOfWeek === dayOfTargetWeek.dayOfWeek) {
          for (let n = 0; n < params.events.length; n++) {
            const event = params.events[n];
            if (
              dayOfSourceWeek.year === event.year &&
              dayOfSourceWeek.month === event.month &&
              dayOfSourceWeek.dayOfMonth === event.dayOfMonth &&
              dayOfSourceWeek.dayOfWeek === event.dayOfWeek
            ) {
              const datetimeOfStart = constructDateTime(
                dayOfTargetWeek.year,
                dayOfTargetWeek.month,
                dayOfTargetWeek.dayOfMonth,
                event.hour,
                event.minute,
                0,
                event.timeZone
              );

              const targetEvent = {
                hostUserId: event.hostUserId,
                datetimeOfStart: datetimeOfStart,
                isLocked: false,
                isPublished: false,
                hour: event.hour,
                minute: event.minute,
                timeZone: event.timeZone,
                minutesOfDuration: event.minutesOfDuration,
                typeId: event.typeId,
                venueId: event.venueId,
              };

              targetEvents.push(targetEvent);
            }
          }
        }
      }
    }

    return targetEvents;
  }
  /* End */

  async updateEvent(
    eventId: number,
    body: Prisma.EventUncheckedUpdateInput & {needToDuplicate?: boolean}
  ) {
    const oldEvent = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
    });

    // [step 0] Collect events to be repeated in this month.
    const otherEvents: object[] = [];
    if (body.needToDuplicate) {
      otherEvents.push(
        ...(await this.prisma.event.findMany({
          where: {
            id: {not: eventId},
            containerId: oldEvent.containerId,
            hostUserId: oldEvent.hostUserId,
            typeId: oldEvent.typeId,
            hour: oldEvent.hour,
            minute: oldEvent.minute,
            dayOfWeek: oldEvent.dayOfWeek,
            isPublished: false,
          },
        }))
      );
    }
    delete body.needToDuplicate;

    // [step 1] Update event.
    if (body.typeId) {
      const eventType = await this.prisma.eventType.findUniqueOrThrow({
        where: {id: body.typeId as number},
      });
      body.minutesOfDuration = eventType.minutesOfDuration;
    }
    const newEvent = await this.prisma.event.update({
      where: {id: eventId},
      data: body,
      include: {type: true},
    });

    // [step 2] Note the update.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'Update class: ' +
          newEvent['type'].name +
          ' at ' +
          newEvent.datetimeOfStart,
        eventContainerId: newEvent.containerId,
        eventId: eventId,
      },
    });

    // [step 3] Check event issues.
    await this.eventIssueService.check(newEvent);

    // [step 4] Attach information.
    newEvent['issues'] = await this.prisma.eventIssue.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: newEvent.id},
    });

    if (newEvent.hostUserId) {
      newEvent['hostUser'] = await this.prisma.userProfile.findUniqueOrThrow({
        where: {userId: newEvent.hostUserId},
        select: {userId: true, fullName: true, coachingTenure: true},
      });
    }

    // [step 5] Duplicate events.
    const diffDays = newEvent.dayOfMonth - oldEvent.dayOfMonth;
    for (let i = 0; i < otherEvents.length; i++) {
      const otherEvent = otherEvents[i] as Event;
      const newDatetimeOfStart = constructDateTime(
        newEvent.year,
        newEvent.month,
        otherEvent.dayOfMonth + diffDays,
        newEvent.hour,
        newEvent.minute,
        0,
        newEvent.timeZone
      );

      const newOtherEvent = await this.prisma.event.update({
        where: {id: otherEvent.id},
        data: {
          hostUserId: newEvent.hostUserId,
          typeId: newEvent.typeId,
          datetimeOfStart: newDatetimeOfStart,
          minutesOfDuration: newEvent.minutesOfDuration,
          timeZone: newEvent.timeZone,
        },
      });

      // Note the update.
      await this.prisma.eventChangeLog.create({
        data: {
          type: EventChangeLogType.USER,
          description:
            'Update class: ' +
            newEvent['type'].name +
            ' at ' +
            newOtherEvent.datetimeOfStart,
          eventContainerId: newOtherEvent.containerId,
          eventId: newOtherEvent.id,
        },
      });
    }

    return newEvent;
  }
}
