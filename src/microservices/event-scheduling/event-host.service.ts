import {Injectable} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {AvailabilityService} from '@microservices/event-scheduling/availability.service';
import {
  ceilByMinutes,
  floorByMinutes,
} from '@framework/utilities/datetime.util';
import {PrismaService} from '@framework/prisma/prisma.service';

const ROLE_NAME_EVENT_HOST = 'Event Host';
const userSelectArgs: Prisma.EventHostSelect = {
  id: true,
  fullName: true,
  eventHostTitle: true,
  quotaOfWeekMin: true,
  quotaOfWeekMax: true,
};

@Injectable()
export class EventHostService {
  private MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT =
      this.availabilityService.MINUTES_Of_TIMESLOT_UNIT;
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
    type UserResult = Prisma.Result<
      typeof this.prisma.eventHost,
      {select: typeof userSelectArgs},
      'findUniqueOrThrow'
    >;

    // [step 1] Get coaches for the specific venue.
    const coaches = await this.prisma.eventHost.findMany({
      where: {
        roles: {some: {name: ROLE_NAME_EVENT_HOST}},
        eventVenueIds: {has: event.venueId},
        eventTypeIds: {has: event.typeId},
      },
      select: userSelectArgs,
    });
    const coachIds = coaches.map(coach => {
      return coach.id;
    });

    // [step 2] Filter available coaches.
    const availableCoaches: UserResult[] = [];

    // [step 2-1] Get availabilities.
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const availabilities = await this.prisma.availabilityTimeslot.findMany({
      where: {
        hostId: {in: coachIds},
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        // status: AvailabilityTimeslotStatus.USABLE,
      },
    });

    // [step 2-2] Get available coaches.
    const sortedAvailableCoaches: {
      hostId: string;
      remainingQuota: number;
      remainingQuotaOfMin: number;
      remainingQuotaOfMax: number;
      quotaOfWeek: number;
      quotaOfWeekMin: number;
      quotaOfWeekMax: number;
    }[] = [];
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const availabilitiesOfOneCoach = availabilities.filter(availability => {
        return availability.hostId === coach.id;
      });
      if (
        availabilitiesOfOneCoach.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT
      ) {
        // Count coach's events in all locations.
        const countOfEvents = await this.prisma.event.count({
          where: {
            hostId: coach.id,
            year: event.year,
            month: event.month,
            weekOfMonth: event.weekOfMonth,
            deletedAt: null,
          },
        });

        // ! A coach can not be dispatched more classes than his/her max preference.
        if (coach['profile']?.quotaOfWeekMax! - countOfEvents > 0) {
          sortedAvailableCoaches.push({
            hostId: coach.id,
            remainingQuota: coach['profile']?.quotaOfWeekMin! - countOfEvents,
            remainingQuotaOfMin:
              coach['profile']?.quotaOfWeekMin! - countOfEvents,
            remainingQuotaOfMax:
              coach['profile']?.quotaOfWeekMax! - countOfEvents,
            quotaOfWeek: coach['profile']?.quotaOfWeekMin!,
            quotaOfWeekMin: coach['profile']?.quotaOfWeekMin!,
            quotaOfWeekMax: coach['profile']?.quotaOfWeekMax!,
          });

          // Count of coach's events in all locations.
          coach['profile']!['quotaOfUsed'] = countOfEvents;
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
        if (a.remainingQuotaOfMin > 0 && b.remainingQuotaOfMin > 0) {
          if (
            a.remainingQuotaOfMin / a.quotaOfWeekMin >=
            b.remainingQuotaOfMin / b.quotaOfWeekMin
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (a.remainingQuotaOfMin <= 0 && b.remainingQuotaOfMin <= 0) {
          // ! The remainingQuotaOfMax must be larger than 0.
          if (
            a.remainingQuotaOfMax / a.quotaOfWeekMax >=
            b.remainingQuotaOfMax / b.quotaOfWeekMax
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (a.remainingQuotaOfMin > 0) {
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
    const finalCoaches: UserResult[] = [];
    for (let m = 0; m < sortedAvailableCoaches.length; m++) {
      const sortedAvailableCoach = sortedAvailableCoaches[m];
      for (let n = 0; n < availableCoaches.length; n++) {
        const availableCoach = availableCoaches[n];
        if (availableCoach.id === sortedAvailableCoach.hostId) {
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
    const coaches = await this.prisma.eventHost.findMany({
      where: {
        roles: {some: {name: ROLE_NAME_EVENT_HOST}},
        eventVenueIds: {has: event.venueId},
        eventTypeIds: {has: event.typeId},
      },
      select: userSelectArgs,
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
    const availabilities = await this.prisma.availabilityTimeslot.findMany({
      where: {
        hostId: {in: coachIds},
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
        return availability.hostId === coach.id;
      });
      if (
        availabilitiesOfOneCoach.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT
      ) {
        coach['isAvailable'] = true;
      } else {
        coach['isAvailable'] = false;
      }

      // Count coach's events in all locations.
      const countOfEvents = await this.prisma.event.count({
        where: {
          hostId: coach.id,
          year: event.year,
          month: event.month,
          weekOfMonth: event.weekOfMonth,
          deletedAt: null,
        },
      });

      coach['quotaOfUsed'] = countOfEvents;
      coach['remainingQuota'] = coach.quotaOfWeekMin! - countOfEvents;
      coach['remainingQuotaOfMin'] = coach.quotaOfWeekMin! - countOfEvents;
      coach['remainingQuotaOfMax'] = coach.quotaOfWeekMax! - countOfEvents;

      // [RC 2023-11-21] A coach is available even she/he has been scheduled more than max preferred number of classes.
      // if (countOfEvents >= coach['profile'].quotaOfWeekMax) {
      //   coach['profile']['isAvailable'] = false;
      // }
    }

    // [step 3] Sort coaches by quota.
    coaches.sort((coachA, coachB) => {
      const a = coachA;
      const b = coachB;
      if (a['remainingQuota'] > 0 && b['remainingQuota'] > 0) {
        if (
          a['remainingQuota'] / a.quotaOfWeekMin! >=
          b['remainingQuota'] / b.quotaOfWeekMin!
        ) {
          return -1; // a is in front of b
        } else {
          return 1; // b is in front of a
        }
      } else if (a['remainingQuota'] <= 0 && b['remainingQuota'] <= 0) {
        if (a['remainingQuotaOfMin'] > 0 && b['remainingQuotaOfMin'] > 0) {
          if (
            a['remainingQuotaOfMin'] / a.quotaOfWeekMin! >=
            b['remainingQuotaOfMin'] / b.quotaOfWeekMin!
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (
          a['remainingQuotaOfMin'] <= 0 &&
          b['remainingQuotaOfMin'] <= 0
        ) {
          // ! The remainingQuotaOfMax must be larger than 0.
          if (
            a['remainingQuotaOfMax'] / a.quotaOfWeekMax! >=
            b['remainingQuotaOfMax'] / b.quotaOfWeekMax!
          ) {
            return -1;
          } else {
            return 1;
          }
        } else if (a['remainingQuotaOfMin'] > 0) {
          return -1;
        } else {
          return 1;
        }
      } else if (a['remainingQuota'] > 0) {
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
