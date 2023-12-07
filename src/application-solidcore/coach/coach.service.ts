import {Injectable} from '@nestjs/common';
import {AvailabilityTimeslotStatus, User} from '@prisma/client';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {ceilByMinutes, floorByMinutes} from '@toolkit/utilities/datetime.util';

const ROLE_NAME_COACH = 'Coach';

@Injectable()
export class CoachService {
  private MINUTES_Of_TIMESLOT_UNIT: number;
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly userService: UserService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT =
      this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT;
  }

  async getSortedCoachesWithQuotaLimit(event: {
    venueId: number;
    typeId: number;
    datetimeOfStart: Date;
    datetimeOfEnd: Date;
    year: number;
    month: number;
    weekOfMonth: number;
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
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const availabilities = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {in: coachIds},
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        // status: AvailabilityTimeslotStatus.USABLE,
      },
    });

    // [step 2-2] Get available coaches.
    const sortedAvailableCoaches: {
      hostUserId: string;
      remainingQuota: number;
      remainingQuotaOfMinPreference: number;
      remainingQuotaOfMaxPreference: number;
      quotaOfWeek: number;
      quotaOfWeekMinPreference: number;
      quotaOfWeekMaxPreference: number;
    }[] = [];
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const availabilitiesOfOneCoach = availabilities.filter(availability => {
        return availability.hostUserId === coach.id;
      });
      if (
        availabilitiesOfOneCoach.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT
      ) {
        // Count coach's events in all locations.
        const countOfEvents = await this.eventService.count({
          where: {
            hostUserId: coach.id,
            year: event.year,
            month: event.month,
            weekOfMonth: event.weekOfMonth,
            deletedAt: null,
          },
        });

        // ! A coach can not be dispatched more classes than his/her max preference.
        if (coach['profile'].quotaOfWeekMaxPreference - countOfEvents > 0) {
          sortedAvailableCoaches.push({
            hostUserId: coach.id,
            remainingQuota: coach['profile'].quotaOfWeek - countOfEvents,
            remainingQuotaOfMinPreference:
              coach['profile'].quotaOfWeekMinPreference - countOfEvents,
            remainingQuotaOfMaxPreference:
              coach['profile'].quotaOfWeekMaxPreference - countOfEvents,
            quotaOfWeek: coach['profile'].quotaOfWeek,
            quotaOfWeekMinPreference: coach['profile'].quotaOfWeekMinPreference,
            quotaOfWeekMaxPreference: coach['profile'].quotaOfWeekMaxPreference,
          });

          // Count of coach's events in all locations.
          coach['profile']['quotaOfUsed'] = countOfEvents;
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
            a.remainingQuotaOfMinPreference / a.quotaOfWeekMinPreference >=
            b.remainingQuotaOfMinPreference / b.quotaOfWeekMinPreference
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
            a.remainingQuotaOfMaxPreference / a.quotaOfWeekMaxPreference >=
            b.remainingQuotaOfMaxPreference / b.quotaOfWeekMaxPreference
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

  async getSortedCoachesWithoutQuotaLimit(event: {
    venueId: number;
    typeId: number;
    datetimeOfStart: Date;
    datetimeOfEnd: Date;
    year: number;
    month: number;
    weekOfMonth: number;
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

    // [step 2] Get availabilities.
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const availabilities = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {in: coachIds},
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        // status: AvailabilityTimeslotStatus.USABLE,
      },
    });

    // [step 3] Check available and calculate class quota of each coach.
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];

      // Check if the coach is available between the start time and end time.
      const availabilitiesOfOneCoach = availabilities.filter(availability => {
        return availability.hostUserId === coach.id;
      });
      if (
        availabilitiesOfOneCoach.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT
      ) {
        coach['profile']['isAvailable'] = true;
      } else {
        coach['profile']['isAvailable'] = false;
      }

      // Count coach's events in all locations.
      const countOfEvents = await this.eventService.count({
        where: {
          hostUserId: coach.id,
          year: event.year,
          month: event.month,
          weekOfMonth: event.weekOfMonth,
          deletedAt: null,
        },
      });

      coach['profile']['quotaOfUsed'] = countOfEvents;
      coach['profile']['remainingQuota'] =
        coach['profile'].quotaOfWeek - countOfEvents;
      coach['profile']['remainingQuotaOfMinPreference'] =
        coach['profile'].quotaOfWeekMinPreference - countOfEvents;
      coach['profile']['remainingQuotaOfMaxPreference'] =
        coach['profile'].quotaOfWeekMaxPreference - countOfEvents;

      // [RC 2023-11-21] A coach is available even she/he has been scheduled more than max preferred number of classes.
      // if (countOfEvents >= coach['profile'].quotaOfWeekMaxPreference) {
      //   coach['profile']['isAvailable'] = false;
      // }
    }

    // [step 3] Sort coaches by quota.
    coaches.sort((coachA, coachB) => {
      const a = coachA['profile'];
      const b = coachB['profile'];
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
            a.remainingQuotaOfMinPreference / a.quotaOfWeekMinPreference >=
            b.remainingQuotaOfMinPreference / b.quotaOfWeekMinPreference
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
            a.remainingQuotaOfMaxPreference / a.quotaOfWeekMaxPreference >=
            b.remainingQuotaOfMaxPreference / b.quotaOfWeekMaxPreference
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

    // [step 4] Return sorted coaches.
    return coaches;
  }

  /* End */
}
