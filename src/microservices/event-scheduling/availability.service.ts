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
    const timeslots: Prisma.AvailabilityTimeslotCreateManyInput[] = [];

    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: expression.timezone,
      currentDate: expression.dateOfOpening.toISOString(),
      endDate: expression.dateOfClosure
        ? expression.dateOfClosure.toISOString()
        : datePlusYears(expression.dateOfOpening, 1),
      iterator: true,
    };

    for (
      let i = 0;
      i < expression.cronExpressionsOfAvailableTimePoints.length;
      i++
    ) {
      const element = expression.cronExpressionsOfAvailableTimePoints[i];
      const interval = CronParser.parseExpression(element, cronParserOptions);

      while (interval.hasNext()) {
        const dateStartTime = new Date(interval.next().value.toString());
        const dateEndTime = datePlusMinutes(
          dateStartTime,
          expression.minutesOfDuration
        );

        const dateStartTimeArr = dateStartTime.toISOString().split('T');
        const dateEndTimeArr = dateEndTime.toISOString().split('T');

        // Construct event period data.
        timeslots.push({
          year: dateStartTime.getFullYear(),
          month: dateStartTime.getMonth(),
          dayOfMonth: dateStartTime.getDate(),
          dayOfWeek: dateStartTime.getDay(),
          hour: dateStartTime.getHours(),
          minute: dateStartTime.getMinutes(),
          minutesOfDuration: expression.minutesOfDuration,
          hostUserId: expression.hostUserId,
          dateOfStart: dateStartTime, // dateStartTimeArr[0],
          timeOfStart: dateStartTime, // dateStartTimeArr[1].replace('.000Z', ''),
          dateOfEnd: dateEndTime, // dateStartTimeArr[0],
          timeOfEnd: dateEndTime, // dateEndTimeArr[1].replace('.000Z', ''),
          expressionId: expression.id,
        });
      }
    }

    return timeslots;
  }
  /* End */
}
