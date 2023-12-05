import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  Prisma,
  AvailabilityTimeslot,
  Event,
  AvailabilityTimeslotStatus,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  ceilByMinutes,
  datePlusMinutes,
  floorByMinutes,
  splitDateTime,
} from '@toolkit/utilities/datetime.util';

@Injectable()
export class AvailabilityTimeslotService {
  public MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT = this.configService.getOrThrow<number>(
      'microservice.eventScheduling.minutesOfTimeslotUnit'
    );
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityTimeslotFindUniqueOrThrowArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityTimeslotFindManyArgs
  ): Promise<AvailabilityTimeslot[]> {
    return await this.prisma.availabilityTimeslot.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityTimeslotCreateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityTimeslotCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityTimeslotUpdateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityTimeslotUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityTimeslotDeleteArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.delete(params);
  }

  async deleteMany(
    params: Prisma.AvailabilityTimeslotDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.deleteMany(params);
  }

  async count(params: Prisma.AvailabilityTimeslotCountArgs): Promise<number> {
    return await this.prisma.availabilityTimeslot.count(params);
  }

  async groupByHostUserId(params: {
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

  generate(params: {
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
  async checkin(event: Event) {
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
  async undoCheckin(event: Event) {
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

  /* End */
}
