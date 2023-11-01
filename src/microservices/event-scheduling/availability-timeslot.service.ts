import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, AvailabilityTimeslot} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {datePlusMinutes, daysOfWeek} from '@toolkit/utilities/datetime.util';

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

  timeslotsOfMonth(params: {
    year: number;
    month: number;
    hourOfOpening: number;
    hourOfClosure: number;
    minutesOfTimeslot: number;
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
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      currentDate: new Date(params.year, params.month - 1, 1),
      endDate: new Date(params.year, params.month, 1),
      iterator: true,
    };

    const interval = parser.parseExpression(
      `0/${params.minutesOfTimeslot} ${params.hourOfOpening}-${
        params.hourOfClosure - 1
      } * ${params.month} *`,
      cronParserOptions
    );

    while (interval.hasNext()) {
      const parsedDatetime = interval.next().value.toDate();

      timeslots.push({
        datetimeOfStart: parsedDatetime,
        datetimeOfEnd: datePlusMinutes(
          parsedDatetime,
          params.minutesOfTimeslot
        ),
        year: parsedDatetime.getFullYear(),
        month: parsedDatetime.getMonth() + 1,
        dayOfMonth: parsedDatetime.getDate(),
        dayOfWeek: parsedDatetime.getDay(),
        hour: parsedDatetime.getHours(),
        minute: parsedDatetime.getMinutes(),
        minutesOfTimeslot: params.minutesOfTimeslot,
      });
    }

    return timeslots;
  }

  timeslotsOfWeek(params: {
    year: number;
    month: number;
    weekOfMonth: number;
    hourOfOpening: number;
    hourOfClosure: number;
    minutesOfTimeslot: number;
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

    const days = daysOfWeek(params.year, params.month, params.weekOfMonth);

    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      currentDate: new Date(params.year, params.month - 1, days[0].dayOfMonth),
      endDate: new Date(
        params.year,
        params.month - 1,
        days[days.length - 1].dayOfMonth + 1
      ),
      iterator: true,
    };

    const interval = parser.parseExpression(
      `0/${params.minutesOfTimeslot} ${params.hourOfOpening}-${
        params.hourOfClosure - 1
      } * ${params.month} *`,
      cronParserOptions
    );

    while (interval.hasNext()) {
      const parsedDatetime = interval.next().value.toDate();

      timeslots.push({
        datetimeOfStart: parsedDatetime,
        datetimeOfEnd: datePlusMinutes(
          parsedDatetime,
          params.minutesOfTimeslot
        ),
        year: parsedDatetime.getFullYear(),
        month: parsedDatetime.getMonth() + 1,
        dayOfMonth: parsedDatetime.getDate(),
        dayOfWeek: parsedDatetime.getDay(),
        hour: parsedDatetime.getHours(),
        minute: parsedDatetime.getMinutes(),
        minutesOfTimeslot: params.minutesOfTimeslot,
      });
    }

    return timeslots;
  }

  /* End */
}
