import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityExpression} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {datePlusMinutes, datePlusYears} from '@toolkit/utilities/date.util';
const CronParser = require('cron-parser');

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.AvailabilityExpressionCreateInput
  ): Promise<AvailabilityExpression> {
    return await this.prisma.$transaction(async tx => {
      // [step 1] Update availability expression.
      const expression: AvailabilityExpression =
        await tx.availabilityExpression.create({data});

      // [step 2] Generate availability timeslots.
      const timeslots = this.parse(expression);

      // [step 3] Create timeslots.
      await tx.availabilityTimeslot.createMany({
        data: timeslots,
      });

      return expression;
    });
  }

  async update(
    availabilityExpressionId: number,
    data: Prisma.AvailabilityExpressionUpdateInput
  ): Promise<AvailabilityExpression> {
    return await this.prisma.$transaction(async tx => {
      // [step 1] Update availability expression.
      const expression: AvailabilityExpression =
        await tx.availabilityExpression.update({
          where: {id: availabilityExpressionId},
          data,
        });

      // [step 2] Generate availability timeslots.
      const timeslots = this.parse(expression);

      // [step 3] Create timeslots.
      await tx.availabilityTimeslot.deleteMany({
        where: {expressionId: expression.id},
      });
      await tx.availabilityTimeslot.createMany({
        data: timeslots,
      });

      return expression;
    });
  }

  parse(expression: AvailabilityExpression) {
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
    const availabilityTimeslots: Prisma.AvailabilityTimeslotCreateManyInput[] =
      [];

    for (
      let i = 0;
      i < expression.cronExpressionsOfAvailableTimePoints.length;
      i++
    ) {
      const element = expression.cronExpressionsOfAvailableTimePoints[i];
      const interval = CronParser.parseExpression(element, cronParserOptions);

      while (interval.hasNext()) {
        const datetimeOfStart = new Date(interval.next().value.toString());
        const datetimeOfEnd = datePlusMinutes(
          datetimeOfStart,
          expression.minutesOfDuration
        );

        availabilityTimeslots.push({
          year: datetimeOfStart.getFullYear(),
          month: datetimeOfStart.getMonth() + 1, // 0-11, January gives 0
          dayOfMonth: datetimeOfStart.getDate(),
          dayOfWeek: datetimeOfStart.getDay(), //0-6, Sunday gives 0
          hour: datetimeOfStart.getHours(),
          minute: datetimeOfStart.getMinutes(),
          minutesOfDuration: expression.minutesOfDuration,
          hostUserId: expression.hostUserId,
          dateOfStart: datetimeOfStart,
          timeOfStart: datetimeOfStart,
          dateOfEnd: datetimeOfEnd,
          timeOfEnd: datetimeOfEnd,
          expressionId: expression.id,
        });
      }
    }

    // [step 3] Parse unavailability expressions and collect unavailability timeslots.
    const unavailabilityTimeslots: {
      datetimeOfStart: Date;
      datetimeOfEnd: Date;
    }[] = [];

    for (
      let j = 0;
      j < expression.cronExpressionsOfUnavailableTimePoints.length;
      j++
    ) {
      const exp = expression.cronExpressionsOfUnavailableTimePoints[j];
      const interval = CronParser.parseExpression(exp, cronParserOptions);

      while (interval.hasNext()) {
        const datetimeOfStart = new Date(interval.next().value.toString());

        unavailabilityTimeslots.push({
          datetimeOfStart: datetimeOfStart,
          datetimeOfEnd: datePlusMinutes(
            datetimeOfStart,
            expression.minutesOfDuration
          ),
        });
      }
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
          availabilityTimeslot.timeOfStart?.toString() ===
            unavailabilityTimeslot.datetimeOfStart.toString() &&
          availabilityTimeslot.timeOfEnd?.toString() ===
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

  /* End */
}
