import {Injectable} from '@nestjs/common';
import {
  Prisma,
  EventIssueType,
  User,
  EventIssueStatus,
  EventStatus,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  dateMinusMinutes,
  datePlusMinutes,
} from '@toolkit/utilities/datetime.util';
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
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async checkContainer({eventContainerId, weekOfMonth}) {
    // Get event container.
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
        status: EventStatus.EDITING,
      },
    });

    if (events.length > 0) {
      const tag = await this.prisma.tag.findFirst({
        where: {name: 'TBD', group: {name: 'Coach'}},
      });
      // Check each issue.
      console.log('events.length', events.length);

      const hostUserIds = events.map(d => d.hostUserId).filter(d => d);
      const eventIds = events.map(d => d.id);

      // [step 0] Delete all old unrepaired issues.
      await this.prisma.eventIssue.deleteMany({
        where: {
          eventId: {
            in: eventIds,
          },
          status: EventIssueStatus.UNREPAIRED,
        },
      });

      const userProfilesByUserId = await this.prisma.userSingleProfile.findMany(
        {
          where: {
            userId: {
              in: hostUserIds as string[],
            },
          },
        }
      );

      const hostUsersById: User[] = await this.prisma.user.findMany({
        where: {id: {in: hostUserIds as string[]}},
        include: {profile: true},
      });

      const issueCreateManyInput: Prisma.EventIssueCreateManyInput[] = [];
      // for (let i = 0; i < [events[0]].length; i++) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        // [solidcore only, 2023-11-20] Do not check locked event or event with TBD coach.
        if (event.status === EventStatus.LOCKED) {
          continue;
        }

        if (tag && event.hostUserId) {
          const _userProfile = _.find(userProfilesByUserId, d => {
            if (d.userId === event.hostUserId) {
              if (d.tagIds && d.tagIds.length > 0) {
                if (d.tagIds.indexOf(tag.id) > -1) {
                  return true;
                }
              }
            }
            return false;
          });

          if (_userProfile) {
            continue;
          }
        }

        // [step 1] Get the coach.
        let hostUser: User | null = null;
        if (event.hostUserId) {
          const _hostUser = _.find(hostUsersById, d => {
            return d.id === event.hostUserId;
          });
          if (_hostUser) {
            hostUser = _hostUser;
          }
        }

        // [step 2] Check issues.

        if (!hostUser) {
          // [step 2-1] Check exist.
          issueCreateManyInput.push({
            type: EventIssueType.ERROR_NONEXISTENT_COACH,
            description: EventIssueDescription.Error_CoachNotExisted,
            eventId: event.id,
          });
        } else if (!hostUser['profile']) {
          // [step 2-2] Check coach profile.
          issueCreateManyInput.push({
            type: EventIssueType.ERROR_UNCONFIGURED_COACH,
            description: EventIssueDescription.Error_CoachNotConfigured,
            eventId: event.id,
          });
        } else {
          // [step 2-3] Check class type.
          if (!hostUser['profile']['eventTypeIds'].includes(event.typeId)) {
            issueCreateManyInput.push({
              type: EventIssueType.ERROR_UNAVAILABLE_EVENT_TYPE,
              description: EventIssueDescription.Error_ClassUnavailable,
              eventId: event.id,
            });
          }

          // [step 2-4] Check location.
          if (!hostUser['profile']['eventVenueIds'].includes(event.venueId)) {
            issueCreateManyInput.push({
              type: EventIssueType.ERROR_UNAVAILABLE_EVENT_VENUE,
              description: EventIssueDescription.Error_LocationUnavailable,
              eventId: event.id,
            });
          }

          // [step 2-5] Check availability
          const count = await this.prisma.availabilityTimeslot.count({
            where: {
              hostUserId: hostUser.id,
              venueIds: {has: event.venueId},
              datetimeOfStart: {lte: event.datetimeOfStart},
              datetimeOfEnd: {gte: event.datetimeOfStart},
            },
          });

          if (count <= 0) {
            issueCreateManyInput.push({
              type: EventIssueType.ERROR_UNAVAILABLE_EVENT_TIME,
              description: EventIssueDescription.Error_TimeUnavailale,
              eventId: event.id,
            });
          }

          // [step 2-6] Check time conflict among different venues.
          const conflictingEvents = await this.prisma.event.findMany({
            where: {
              hostUserId: hostUser.id,
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
                EventIssueDescription.Error_TimeConflict +
                '(' +
                stringVenues +
                ')',
              eventId: event.id,
            });
          }
        }
      }
      if (issueCreateManyInput.length > 0) {
        await this.prisma.eventIssue.createMany({data: issueCreateManyInput});
      }
    }
    return await this.prisma.eventIssue.findMany({
      where: {
        status: EventIssueStatus.UNREPAIRED,
        event: {
          containerId: eventContainerId,
          year: container.year,
          month: container.month,
          weekOfMonth,
        },
      },
    });
  }

  /* End */
}
