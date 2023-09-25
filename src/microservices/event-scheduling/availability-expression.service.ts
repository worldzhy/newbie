import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, AvailabilityExpression} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {datePlusMinutes, datePlusYears} from '@toolkit/utilities/datetime.util';
const CronParser = require('cron-parser');

@Injectable()
export class AvailabilityExpressionService {
  private MINUTES_Of_TIMESLOT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT = parseInt(
      this.configService.getOrThrow<string>(
        'microservice.eventScheduling.minutesOfTimeslot'
      )
    );
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityExpressionFindUniqueOrThrowArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityExpressionFindManyArgs
  ): Promise<AvailabilityExpression[]> {
    return await this.prisma.availabilityExpression.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.AvailabilityExpressionFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.AvailabilityExpression,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.AvailabilityExpressionCreateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityExpressionCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityExpressionUpdateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityExpressionUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityExpressionDeleteArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.delete(params);
  }

  async parse(id: number) {
    const expression =
      await this.prisma.availabilityExpression.findUniqueOrThrow({
        where: {id},
      });

    // [step 1] Construct cron parser options.
    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: expression.timezone,
      currentDate: expression.dateOfOpening.toISOString(),
      endDate: expression.dateOfClosure
        ? expression.dateOfClosure.toISOString()
        : datePlusYears(expression.dateOfOpening, 1),
      iterator: true,
    };

    // [step 2] Parse availability expressions and collect availability timeslots.
    let availabilityTimeslots: Prisma.AvailabilityTimeslotCreateManyInput[] =
      [];

    for (
      let i = 0;
      i < expression.cronExpressionsOfAvailableTimePoints.length;
      i++
    ) {
      const exp = expression.cronExpressionsOfAvailableTimePoints[i];
      availabilityTimeslots = availabilityTimeslots.concat(
        this.parseExpression({
          expressionId: expression.id,
          hostUserId: expression.hostUserId,
          minutesOfDuration: expression.minutesOfDuration,
          cronExpression: exp,
          cronParserOptions: cronParserOptions,
        })
      );
    }

    // [step 3] Parse unavailability expressions and collect unavailability timeslots.
    let unavailabilityTimeslots: Prisma.AvailabilityTimeslotCreateManyInput[] =
      [];

    for (
      let j = 0;
      j < expression.cronExpressionsOfUnavailableTimePoints.length;
      j++
    ) {
      const exp = expression.cronExpressionsOfUnavailableTimePoints[j];
      unavailabilityTimeslots = unavailabilityTimeslots.concat(
        this.parseExpression({
          expressionId: expression.id,
          hostUserId: expression.hostUserId,
          minutesOfDuration: expression.minutesOfDuration,
          cronExpression: exp,
          cronParserOptions: cronParserOptions,
        })
      );
    }

    // [step 4] Collect final availability timeslots.
    const finalAvailabilityTimeslots: Prisma.AvailabilityTimeslotCreateManyInput[] =
      [];
    for (let m = 0; m < availabilityTimeslots.length; m++) {
      const availabilityTimeslot = availabilityTimeslots[m];
      let matched = false;
      for (let n = 0; n < unavailabilityTimeslots.length; n++) {
        const unavailabilityTimeslot = unavailabilityTimeslots[n];
        if (
          availabilityTimeslot.datetimeOfStart.toString() ===
            unavailabilityTimeslot.datetimeOfStart.toString() &&
          availabilityTimeslot.datetimeOfEnd.toString() ===
            unavailabilityTimeslot.datetimeOfEnd.toString()
        ) {
          matched = true;
        }
      }

      if (!matched) {
        finalAvailabilityTimeslots.push(availabilityTimeslot);
      }
    }

    return finalAvailabilityTimeslots;
  }

  private parseExpression(params: {
    expressionId: number;
    hostUserId: string;
    minutesOfDuration: number;
    cronExpression: string;
    cronParserOptions: any;
  }) {
    const interval = CronParser.parseExpression(
      params.cronExpression,
      params.cronParserOptions
    );
    const timeslots: Prisma.AvailabilityTimeslotCreateManyInput[] = [];
    while (interval.hasNext()) {
      const parsedDatetime = interval.next().value.toDate();

      for (
        let i = 0;
        i < params.minutesOfDuration / this.MINUTES_Of_TIMESLOT;
        i++
      ) {
        const datetimeOfStart = datePlusMinutes(
          parsedDatetime,
          this.MINUTES_Of_TIMESLOT * i
        );
        const datetimeOfEnd = datePlusMinutes(
          datetimeOfStart,
          this.MINUTES_Of_TIMESLOT
        );

        timeslots.push({
          hostUserId: params.hostUserId,
          datetimeOfStart: datetimeOfStart,
          datetimeOfEnd: datetimeOfEnd,
          year: datetimeOfStart.getFullYear(),
          month: datetimeOfStart.getMonth() + 1, // 0-11, January gives 0
          dayOfMonth: datetimeOfStart.getDate(),
          dayOfWeek: datetimeOfStart.getDay(), //0-6, Sunday gives 0
          hour: datetimeOfStart.getHours(),
          minute: datetimeOfStart.getMinutes(),
          minutesOfTimeslot: this.MINUTES_Of_TIMESLOT,
          expressionId: params.expressionId,
        });
      }
    }

    return timeslots;
  }

  /* End */
}
