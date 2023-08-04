import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../toolkit/prisma/prisma.service';
import {
  datePlusMinutes,
  datePlusYearsForString,
} from '../../toolkit/utilities/common.util';
import {AvailabilityContainerStatus, Event, Prisma} from '@prisma/client';
const CronParser = require('cron-parser');

@Injectable()
export class EventCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async createEventCalendar(params: {
    event: {
      name: string;
      minutesOfDuration: number;
      minutesInAdvanceToReserve: number;
      minutesInAdanceToCancel: number;
      numberOfSeats: number;
    };
    availabilityContainer: {
      status: AvailabilityContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    availabilities: [{cronExpression: string}];
  }) {
    return await this.prisma.$transaction(async tx => {
      const event = await this.prisma.event.create({data: params.event});
      const availabilityContainer =
        await this.prisma.availabilityContainer.create({
          data: params.availabilityContainer,
        });
      return await this.setAvailabilityForEvents({
        defaultEventId: event.id,
        availabilityContainerId: availabilityContainer.id,
        availabilities: params.availabilities,
      });
    });
  }

  /**
   * *Usage scenario 1: Set availability for only one event. In this case, 'defaultEventId' is required.
   * *Usage scenario 2: Set availability for multiple events. In this case, 'defaultEventId' shouldn't appear.
   */
  async setAvailabilityForEvents(params: {
    defaultEventId?: number;
    availabilityContainerId: number;
    availabilities: [{cronExpression: string; eventId?: number}];
  }) {
    // [step 1] Get availability container.
    const availabilityContainer =
      await this.prisma.availabilityContainer.findUniqueOrThrow({
        where: {id: params.availabilityContainerId},
      });

    // [step 2] Get only one event.
    let defaultEvent: Event | undefined = undefined;
    if (params.defaultEventId) {
      defaultEvent = await this.prisma.event.findUniqueOrThrow({
        where: {id: params.defaultEventId},
      });
    }

    // [step 3] Parse availability cron expressions.
    const availabilities: object[] = [];
    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: availabilityContainer.timezone,
      currentDate: availabilityContainer.dateOfOpening + ' 00:00:01',
      endDate: availabilityContainer.dateOfClosure
        ? availabilityContainer.dateOfClosure + ' 00:00:01'
        : datePlusYearsForString(
            availabilityContainer.dateOfOpening as unknown as string,
            1
          ),
      iterator: true,
    };

    for (let i = 0; i < params.availabilities.length; i++) {
      let event: Event;
      const element = params.availabilities[i];
      if (defaultEvent) {
        event = defaultEvent;
      } else {
        event = await this.prisma.event.findUniqueOrThrow({
          where: {id: element.eventId},
        });
      }

      const interval = CronParser.parseExpression(
        element.cronExpression,
        cronParserOptions
      );

      while (interval.hasNext()) {
        const dateStartTime = new Date(interval.next().value.toString());
        const dateEndTime = datePlusMinutes(
          dateStartTime,
          event.minutesOfDuration
        );

        const dateStartTimeArr = dateStartTime.toISOString().split('T');
        const dateEndTimeArr = dateEndTime.toISOString().split('T');

        // Construct availability period data.
        availabilities.push({
          date: dateStartTimeArr[0],
          timeOfStarting: dateStartTimeArr[1].replace('.000Z', ''),
          timeOfEnding: dateEndTimeArr[1].replace('.000Z', ''),
          eventId: event.id,
          containerId: params.availabilityContainerId,
        });
      }
    }

    // [step 4] Create event availabilities according to the result of parsing.
    await this.prisma.availability.createMany({
      data: availabilities as Prisma.AvailabilityCreateManyInput[],
    });
  }

  /* End */
}
