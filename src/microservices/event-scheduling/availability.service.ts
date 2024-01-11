import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Event, AvailabilityTimeslotStatus, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  ceilByMinutes,
  datePlusMinutes,
  datePlusYears,
  floorByMinutes,
  splitDateTime,
} from '@toolkit/utilities/datetime.util';
const CronParser = require('cron-parser');

@Injectable()
export class AvailabilityService {
  public MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT = this.configService.getOrThrow<number>(
      'microservice.eventScheduling.minutesOfTimeslotUnit'
    );
  }

  async parseAvailabilityExpression(id: number) {
    const expression =
      await this.prisma.availabilityExpression.findUniqueOrThrow({
        where: {id},
      });

    // [step 1] Construct cron parser options.
    const venues = await this.prisma.eventVenue.findMany({
      where: {id: {in: expression.venueIds}},
      select: {placeId: true},
    });
    const placeIds = venues
      .filter(venue => venue.placeId !== null || undefined)
      .map(venue => venue.placeId!);
    const places = await this.prisma.place.findMany({
      where: {id: {in: placeIds}},
      select: {timeZone: true},
    });

    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: places[0] ? places[0].timeZone : undefined,
      currentDate: expression.dateOfOpening.toISOString(),
      endDate: expression.dateOfClosure
        ? expression.dateOfClosure.toISOString()
        : datePlusYears(expression.dateOfOpening, 1),
      iterator: true,
    };

    // [step 2] Parse availability expressions and collect availability timeslots.
    let availabilityTimeslots: Prisma.AvailabilityTimeslotUncheckedUpdateInput[] =
      [];

    for (
      let i = 0;
      i < expression.cronExpressionsOfAvailableTimePoints.length;
      i++
    ) {
      const exp = expression.cronExpressionsOfAvailableTimePoints[i];
      availabilityTimeslots = availabilityTimeslots.concat(
        this.parseCronExpression({
          cronExpression: exp,
          cronParserOptions: cronParserOptions,
          minutesOfDuration: expression.minutesOfDuration,
        })
      );
    }

    // [step 3] Parse unavailability expressions and collect unavailability timeslots.
    let unavailabilityTimeslots: Prisma.AvailabilityTimeslotUncheckedUpdateInput[] =
      [];

    for (
      let j = 0;
      j < expression.cronExpressionsOfUnavailableTimePoints.length;
      j++
    ) {
      const exp = expression.cronExpressionsOfUnavailableTimePoints[j];
      unavailabilityTimeslots = unavailabilityTimeslots.concat(
        this.parseCronExpression({
          cronExpression: exp,
          cronParserOptions: cronParserOptions,
          minutesOfDuration: expression.minutesOfDuration,
        })
      );
    }

    // [step 4] Collect final availability timeslots.
    const finalAvailabilityTimeslots: Prisma.AvailabilityTimeslotUncheckedUpdateInput[] =
      [];
    for (let m = 0; m < availabilityTimeslots.length; m++) {
      const availabilityTimeslot = availabilityTimeslots[m];
      let matched = false;
      for (let n = 0; n < unavailabilityTimeslots.length; n++) {
        const unavailabilityTimeslot = unavailabilityTimeslots[n];
        if (
          availabilityTimeslot.datetimeOfStart!.toString() ===
            unavailabilityTimeslot.datetimeOfStart!.toString() &&
          availabilityTimeslot.datetimeOfEnd!.toString() ===
            unavailabilityTimeslot.datetimeOfEnd!.toString()
        ) {
          matched = true;
        }
      }

      if (!matched) {
        finalAvailabilityTimeslots.push(availabilityTimeslot);
      }
    }

    return finalAvailabilityTimeslots.map(timeslot => {
      timeslot.expressionId = expression.id;
      timeslot.hostUserId = expression.hostUserId;
      timeslot.venueIds = expression.venueIds;
      return timeslot as Prisma.AvailabilityTimeslotCreateManyInput;
    });
  }

  async getTimeslotsGroupByHostUserId(params: {
    hostUserIds: string[];
    venueId: number;
    datetimeOfStart: Date;
    datetimeOfEnd: Date;
  }) {
    return await this.prisma.availabilityTimeslot.groupBy({
      by: ['hostUserId'],
      where: {
        hostUserId: {
          in: params.hostUserIds,
        },
        venueIds: {has: params.venueId},
        datetimeOfStart: {gte: params.datetimeOfStart},
        datetimeOfEnd: {lte: params.datetimeOfEnd},
      },
      _count: {hostUserId: true},
    });
  }

  generateTimeslots(params: {
    dateOfStart: Date;
    dateOfEnd: Date;
    hourOfOpening: number;
    hourOfClosure: number;
    minutesOfTimeslot: number;
    timeZone?: string;
  }) {
    const parser = require('cron-parser');
    const timeslots: {
      datetimeOfStart: Date;
      datetimeOfEnd: Date;
      year: number;
      month: number;
      dayOfMonth: number;
      dayOfWeek: number;
      hour: number;
      minute: number;
      minutesOfTimeslot: number;
    }[] = [];

    const cronParserOptions = {
      tz: params.timeZone,
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      currentDate: params.dateOfStart,
      endDate: params.dateOfEnd,
      iterator: true,
    };

    const interval = parser.parseExpression(
      `0/${params.minutesOfTimeslot} ${params.hourOfOpening}-${
        params.hourOfClosure - 1
      } * * *`,
      cronParserOptions
    );

    while (interval.hasNext()) {
      const parsedDatetime = interval.next().value.toDate();
      const splitedDateTime = splitDateTime(parsedDatetime, params.timeZone);

      timeslots.push({
        datetimeOfStart: parsedDatetime,
        datetimeOfEnd: datePlusMinutes(
          parsedDatetime,
          params.minutesOfTimeslot
        ),
        year: splitedDateTime.year,
        month: splitedDateTime.month,
        dayOfMonth: splitedDateTime.dayOfMonth,
        dayOfWeek: splitedDateTime.dayOfWeek,
        hour: splitedDateTime.hour,
        minute: splitedDateTime.minute,
        minutesOfTimeslot: params.minutesOfTimeslot,
      });
    }

    return timeslots;
  }

  /**
   * ! This function is not used anymore because it costs too much database computing resource.
   */
  async checkinTimeslots(event: Event) {
    if (!event.hostUserId) {
      return;
    }

    // The start time and end time should cover an integer number of timeslots.
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );

    await this.prisma.availabilityTimeslot.updateMany({
      where: {
        hostUserId: event.hostUserId,
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
      },
      data: {status: AvailabilityTimeslotStatus.USED},
    });
  }

  /**
   * ! This function is not used anymore because it costs too much database computing resource.
   */
  async undoCheckinTimeslots(event: Event) {
    if (!event.hostUserId) {
      return;
    }

    // The start time and end time should cover an integer number of timeslots.
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );

    await this.prisma.availabilityTimeslot.updateMany({
      where: {
        hostUserId: event.hostUserId,
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
      },
      data: {status: AvailabilityTimeslotStatus.USABLE},
    });
  }

  private parseCronExpression(args: {
    cronExpression: string;
    cronParserOptions: any;
    minutesOfDuration: number;
  }) {
    const interval = CronParser.parseExpression(
      args.cronExpression,
      args.cronParserOptions
    );
    const timeslots: Prisma.AvailabilityTimeslotUncheckedUpdateInput[] = [];
    while (interval.hasNext()) {
      const parsedDatetime = interval.next().value.toDate();

      for (
        let i = 0;
        i < args.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT;
        i++
      ) {
        const datetimeOfStart = datePlusMinutes(
          parsedDatetime,
          this.MINUTES_Of_TIMESLOT_UNIT * i
        );
        const datetimeOfEnd = datePlusMinutes(
          datetimeOfStart,
          this.MINUTES_Of_TIMESLOT_UNIT
        );

        timeslots.push({
          datetimeOfStart: datetimeOfStart,
          datetimeOfEnd: datetimeOfEnd,
          // year: datetimeOfStart.getFullYear(),
          // month: datetimeOfStart.getMonth() + 1, // 0-11, January gives 0
          // dayOfMonth: datetimeOfStart.getDate(),
          // dayOfWeek: datetimeOfStart.getDay(), //0-6, Sunday gives 0
          // hour: datetimeOfStart.getHours(),
          // minute: datetimeOfStart.getMinutes(),
          minutesOfTimeslot: this.MINUTES_Of_TIMESLOT_UNIT,
        });
      }
    }

    return timeslots;
  }

  /* End */
}
