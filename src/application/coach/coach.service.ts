import {Injectable} from '@nestjs/common';
import {AvailabilityTimeslotStatus, User} from '@prisma/client';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';
import {EventService} from '@microservices/event-scheduling/event.service';

const ROLE_NAME_COACH = 'Coach';

@Injectable()
export class CoachService {
  private MINUTES_Of_TIMESLOT: number;
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly userService: UserService
  ) {
    this.MINUTES_Of_TIMESLOT =
      this.availabilityTimeslotService.MINUTES_Of_TIMESLOT;
  }

  async getSortedCoachesForEvent(event: {
    venueId: number;
    typeId: number;
    datetimeOfStart: Date;
    datetimeOfEnd: Date;
    year: number;
    month: number;
    week: number;
    minutesOfDuration: number;
  }) {
    // [step 1] Get coaches for the specific venue.
    const coaches = await this.userService.findMany({
      where: {
        roles: {some: {name: ROLE_NAME_COACH}},
        profile: {
          eventVenueIds: {has: event.venueId},
          eventTypeIds: {has: event.typeId},
        },
      },
      select: {
        id: true,
        profile: {
          select: {
            fullName: true,
            coachingTenure: true,
            quotaOfWeek: true,
            quotaOfWeekMinPreference: true,
            quotaOfWeekMaxPreference: true,
          },
        },
      },
    });
    const coachIds = coaches.map(coach => {
      return coach.id;
    });

    // [step 2] Filter available coaches.
    const availableCoaches: User[] = [];

    // [step 2-1] Get availabilities.
    const newDatetimeOfStart =
      this.availabilityTimeslotService.floorDatetimeOfStart(
        event.datetimeOfStart
      );
    const newDatetimeOfEnd = this.availabilityTimeslotService.ceilDatetimeOfEnd(
      event.datetimeOfEnd
    );
    const availabilities = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {in: coachIds},
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });

    // [step 2-2] Get available coaches.
    const sortedAvailableCoaches: {
      hostUserId: string;
      remainingQuota: number;
      remainingQuotaOfMinPreference: number;
      remainingQuotaOfMaxPreference: number;
      quotaOfWeek: number;
      quotaOfWeekMinPerference: number;
      quotaOfWeekMaxPerference: number;
    }[] = [];
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const availabilitiesOfOneCoach = availabilities.filter(availability => {
        return availability.hostUserId === coach.id;
      });
      if (
        availabilitiesOfOneCoach.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT
      ) {
        const countOfEvents = await this.eventService.count({
          where: {
            hostUserId: coach.id,
            year: event.year,
            month: event.month,
            week: event.week,
          },
        });

        // ! A coach can not be dispatched more classes than his/her max preference.
        if (coach['profile'].quotaOfWeekMaxPerference - countOfEvents > 0) {
          sortedAvailableCoaches.push({
            hostUserId: coach.id,
            remainingQuota: coach['profile'].quotaOfWeek - countOfEvents,
            remainingQuotaOfMinPreference:
              coach['profile'].quotaOfWeekMinPerference - countOfEvents,
            remainingQuotaOfMaxPreference:
              coach['profile'].quotaOfWeekMaxPerference - countOfEvents,
            quotaOfWeek: coach['profile'].quotaOfWeek,
            quotaOfWeekMinPerference: coach['profile'].quotaOfWeekMinPerference,
            quotaOfWeekMaxPerference: coach['profile'].quotaOfWeekMaxPerference,
          });

          availableCoaches.push(coach);
        }
      }
    }

    // [step 3] Sort available coaches by quota.
    sortedAvailableCoaches.sort((a, b) => {
      if (a.remainingQuota > 0 && b.remainingQuota > 0) {
        if (
          a.remainingQuota / a.quotaOfWeek >=
          b.remainingQuota / b.quotaOfWeek
        ) {
          return -1; // a is in front of b
        } else {
          return 1; // b is in front of a
        }
      } else if (a.remainingQuota <= 0 && b.remainingQuota <= 0) {
        if (
          a.remainingQuotaOfMinPreference > 0 &&
          b.remainingQuotaOfMinPreference > 0
        ) {
          if (
            a.remainingQuotaOfMinPreference / a.quotaOfWeekMinPerference >=
            b.remainingQuotaOfMinPreference / b.quotaOfWeekMinPerference
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (
          a.remainingQuotaOfMinPreference <= 0 &&
          b.remainingQuotaOfMinPreference <= 0
        ) {
          // ! The remainingQuotaOfMaxPreference must be larger than 0.
          if (
            a.remainingQuotaOfMaxPreference / a.quotaOfWeekMaxPerference >=
            b.remainingQuotaOfMaxPreference / b.quotaOfWeekMaxPerference
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (a.remainingQuotaOfMinPreference > 0) {
          return -1;
        } else {
          return 1;
        }
      } else if (a.remainingQuota > 0) {
        return -1;
      } else {
        return 1;
      }
    });

    // [step 4] Return sorted available coaches.
    const finalCoaches: User[] = [];
    for (let m = 0; m < sortedAvailableCoaches.length; m++) {
      const sortedAvailableCoach = sortedAvailableCoaches[m];
      for (let n = 0; n < availableCoaches.length; n++) {
        const availableCoach = availableCoaches[n];
        if (availableCoach.id === sortedAvailableCoach.hostUserId) {
          finalCoaches[m] = availableCoach;
        }
      }
    }
    return finalCoaches;
  }

  /* End */
}
