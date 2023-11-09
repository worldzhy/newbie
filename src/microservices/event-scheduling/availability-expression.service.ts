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
    this.MINUTES_Of_TIMESLOT = this.configService.getOrThrow<number>(
      'microservice.eventScheduling.minutesOfTimeslotUnit'
    );
  }

  async findFirst(
    args: Prisma.AvailabilityExpressionFindFirstArgs
  ): Promise<AvailabilityExpression | null> {
    return await this.prisma.availabilityExpression.findFirst(args);
  }

  async findUniqueOrThrow(
    args: Prisma.AvailabilityExpressionFindUniqueOrThrowArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.AvailabilityExpressionFindManyArgs
  ): Promise<AvailabilityExpression[]> {
    return await this.prisma.availabilityExpression.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.AvailabilityExpressionFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.AvailabilityExpression,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.AvailabilityExpressionCreateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.create(args);
  }

  async createMany(
    args: Prisma.AvailabilityExpressionCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.createMany(args);
  }

  async update(
    args: Prisma.AvailabilityExpressionUpdateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.update(args);
  }

  async updateMany(
    args: Prisma.AvailabilityExpressionUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.updateMany(args);
  }

  async delete(
    args: Prisma.AvailabilityExpressionDeleteArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.delete(args);
  }

  async deleteMany(
    args: Prisma.AvailabilityExpressionDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.deleteMany(args);
  }

  async parse(id: number) {
    const expression = await this.prisma.availabilityExpression.findUnique({
      where: {id},
    });

    if (!expression) {
      return [];
    }

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
    let availabilityTimeslots: Prisma.AvailabilityTimeslotUncheckedUpdateInput[] =
      [];

    for (
      let i = 0;
      i < expression.cronExpressionsOfAvailableTimePoints.length;
      i++
    ) {
      const exp = expression.cronExpressionsOfAvailableTimePoints[i];
      availabilityTimeslots = availabilityTimeslots.concat(
        this.parseExpression({
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
        this.parseExpression({
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

  private parseExpression(args: {
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
        i < args.minutesOfDuration / this.MINUTES_Of_TIMESLOT;
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
          datetimeOfStart: datetimeOfStart,
          datetimeOfEnd: datetimeOfEnd,
          year: datetimeOfStart.getFullYear(),
          month: datetimeOfStart.getMonth() + 1, // 0-11, January gives 0
          dayOfMonth: datetimeOfStart.getDate(),
          dayOfWeek: datetimeOfStart.getDay(), //0-6, Sunday gives 0
          hour: datetimeOfStart.getHours(),
          minute: datetimeOfStart.getMinutes(),
          minutesOfTimeslot: this.MINUTES_Of_TIMESLOT,
        });
      }
    }

    return timeslots;
  }

  /* End */
}
