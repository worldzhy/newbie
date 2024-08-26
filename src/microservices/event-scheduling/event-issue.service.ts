import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  Prisma,
  EventIssueType,
  Event,
  EventIssueStatus,
  EventStatus,
  EventHost,
} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  ceilByMinutes,
  dateMinusMinutes,
  datePlusMinutes,
  floorByMinutes,
} from '@framework/utilities/datetime.util';
import * as _ from 'lodash';

enum EventIssueDescription {
  Error_CoachNotExisted = 'The coach is not existed.',
  Error_CoachNotConfigured = 'The coach has not been configured.',
  Error_TimeUnavailale = 'The coach is not available at this time.',
  Error_TimeConflict = 'The coach was scheduled at another location at this period of time.',
  Error_ClassUnavailable = 'The coach is not able to teach this type of class.',
  Error_LocationUnavailable = 'The coach is not able to teach in this location.',
}

const MINUTES_OF_CONFLICT_DISTANCE = 60;

@Injectable()
export class EventIssueService {
  private MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT = this.configService.getOrThrow<number>(
      'microservices.eventScheduling.minutesOfTimeslotUnit'
    );
  }

  async check(event: Event) {
    // [solidcore only, 2023-11-20] Do not check locked event.
    if (event.status === EventStatus.LOCKED) {
      return;
    }

    if (event.hostId) {
      if (
        (await this.prisma.eventHost.count({
          where: {id: event.hostId},
        })) > 0
      ) {
        return;
      }
    }

    // [step 0] Delete old unrepaired issues.
    await this.prisma.eventIssue.deleteMany({
      where: {eventId: event.id, status: EventIssueStatus.UNREPAIRED},
    });

    // [step 1] Get the coach.
    let eventHost: EventHost | null = null;
    if (event.hostId) {
      eventHost = await this.prisma.eventHost.findUnique({
        where: {id: event.hostId},
      });
    }

    // [step 2] Check issues.
    const issueCreateManyInput: Prisma.EventIssueCreateManyInput[] = [];
    if (!eventHost) {
      // [step 2-1] Check exist.
      issueCreateManyInput.push({
        type: EventIssueType.ERROR_NONEXISTENT_COACH,
        description: EventIssueDescription.Error_CoachNotExisted,
        eventId: event.id,
      });
    } else {
      // [step 2-3] Check class type.
      if (!eventHost.eventTypeIds.includes(event.typeId)) {
        issueCreateManyInput.push({
          type: EventIssueType.ERROR_UNAVAILABLE_EVENT_TYPE,
          description: EventIssueDescription.Error_ClassUnavailable,
          eventId: event.id,
        });
      }

      // [step 2-4] Check location.
      if (!eventHost.eventVenueIds.includes(event.venueId)) {
        issueCreateManyInput.push({
          type: EventIssueType.ERROR_UNAVAILABLE_EVENT_VENUE,
          description: EventIssueDescription.Error_LocationUnavailable,
          eventId: event.id,
        });
      }

      // [step 2-5] Check availability
      const newDatetimeOfStart = floorByMinutes(
        event.datetimeOfStart,
        this.MINUTES_Of_TIMESLOT_UNIT
      );
      const newDatetimeOfEnd = ceilByMinutes(
        event.datetimeOfEnd,
        this.MINUTES_Of_TIMESLOT_UNIT
      );

      const count = await this.prisma.availabilityTimeslot.count({
        where: {
          hostId: eventHost.id,
          venueIds: {has: event.venueId},
          datetimeOfStart: {gte: newDatetimeOfStart},
          datetimeOfEnd: {lte: newDatetimeOfEnd},
        },
      });
      if (count < event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT) {
        issueCreateManyInput.push({
          type: EventIssueType.ERROR_UNAVAILABLE_EVENT_TIME,
          description: EventIssueDescription.Error_TimeUnavailale,
          eventId: event.id,
        });
      }

      // [step 2-6] Check time conflict among different venues.
      const conflictingEvents = await this.prisma.event.findMany({
        where: {
          hostId: eventHost.id,
          venueId: {not: event.venueId},
          datetimeOfStart: {
            lt: datePlusMinutes(
              event.datetimeOfEnd,
              MINUTES_OF_CONFLICT_DISTANCE
            ),
          },
          datetimeOfEnd: {
            gt: dateMinusMinutes(
              event.datetimeOfStart,
              MINUTES_OF_CONFLICT_DISTANCE
            ),
          },
          deletedAt: null,
        },
        select: {venue: {select: {name: true}}},
      });
      if (conflictingEvents.length > 0) {
        const stringVenues = conflictingEvents
          .map(event => {
            return event['venue'].name;
          })
          .toString();
        issueCreateManyInput.push({
          type: EventIssueType.ERROR_CONFLICTING_EVENT_TIME,
          description:
            EventIssueDescription.Error_TimeConflict + '(' + stringVenues + ')',
          eventId: event.id,
        });
      }
    }

    if (issueCreateManyInput.length > 0) {
      await this.prisma.eventIssue.createMany({data: issueCreateManyInput});
    }
  }

  /* End */
}
