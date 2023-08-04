import {Injectable} from '@nestjs/common';
import {
  AvailabilityContainer,
  AvailabilityContainerStatus,
  Event,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';
import {
  datePlusMinutes,
  datePlusYears,
} from '../../toolkit/utilities/common.util';
const CronParser = require('cron-parser');

@Injectable()
export class EventCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * *Usage scenario 1: Create calendar for single event. In this case, 'event' is required.
   * *Usage scenario 2: Create calendar for multiple events. In this case, 'event' shouldn't appear.
   */
  async createEventCalendar(params: {
    event?: {
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
    availabilities: [{cronExpression: string; eventId?: number}];
  }): Promise<{
    event: Event | undefined;
    availabilityContainer: AvailabilityContainer;
  }> {
    return await this.prisma.$transaction<{
      event: Event | undefined;
      availabilityContainer: AvailabilityContainer;
    }>(async tx => {
      // [step 1] Create availability container.
      const availabilityContainer = await tx.availabilityContainer.create({
        data: params.availabilityContainer,
      });

      // [step 2] Construct data of availabilities.
      let newEvent: Event | undefined;
      if (params.event) {
        newEvent = await tx.event.create({data: params.event});
      }
      const constructedAvailabilities = await this.constructAvailabilities({
        defaultEvent: newEvent,
        availabilityContainer: availabilityContainer,
        availabilities: params.availabilities,
      });

      // [step 3] Create availabilities.
      await tx.availability.createMany({
        data: constructedAvailabilities as Prisma.AvailabilityCreateManyInput[],
      });

      // [step 4] Return.
      const generatedAvailabilities = await tx.availability.findMany({
        where: {containerId: availabilityContainer.id},
      });
      return {
        event: newEvent,
        availabilityContainer,
        availabilities: generatedAvailabilities,
      };
    });
  }

  /**
   * *Usage scenario 1: Update calendar for single event. In this case, 'event' is required.
   * *Usage scenario 2: Update calendar for multiple events. In this case, 'event' shouldn't appear.
   */
  async updateEventCalendar(params: {
    event?: {
      id: number;
      name: string;
      minutesOfDuration: number;
      minutesInAdvanceToReserve: number;
      minutesInAdanceToCancel: number;
      numberOfSeats: number;
    };
    availabilityContainer: {
      id: number;
      status: AvailabilityContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    availabilities: [{cronExpression: string; eventId?: number}];
  }): Promise<{
    event: Event | undefined;
    availabilityContainer: AvailabilityContainer;
  }> {
    return await this.prisma.$transaction<{
      event: Event | undefined;
      availabilityContainer: AvailabilityContainer;
    }>(async tx => {
      // [step 1] Delete existing availabilities related to this container.
      await tx.availability.deleteMany({
        where: {containerId: params.availabilityContainer.id},
      });

      // [step 2] Update availability container.
      const updatedAvailabilityContainer =
        await tx.availabilityContainer.update({
          where: {id: params.availabilityContainer.id},
          data: params.availabilityContainer,
        });

      // [step 3] Construct data of availabilities.
      let updatedEvent: Event | undefined;
      if (params.event) {
        updatedEvent = await tx.event.update({
          where: {id: params.event.id},
          data: params.event,
        });
      }
      const constructedAvailabilities = await this.constructAvailabilities({
        defaultEvent: updatedEvent,
        availabilityContainer: updatedAvailabilityContainer,
        availabilities: params.availabilities,
      });

      // [step 4] Create availabilities.
      await tx.availability.createMany({
        data: constructedAvailabilities as Prisma.AvailabilityCreateManyInput[],
      });

      // [step 5] Return.
      const generatedAvailabilities = await tx.availability.findMany({
        where: {containerId: updatedAvailabilityContainer.id},
      });
      return {
        event: updatedEvent,
        availabilityContainer: updatedAvailabilityContainer,
        availabilities: generatedAvailabilities,
      };
    });
  }

  /**
   * Return an availability array.
   */
  private async constructAvailabilities(params: {
    defaultEvent?: Event;
    availabilityContainer: AvailabilityContainer;
    availabilities: [{cronExpression: string; eventId?: number}];
  }) {
    // [step 1] Construct the cron-parser options.
    const container = params.availabilityContainer;
    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: container.timezone,
      currentDate: container.dateOfOpening.toISOString(),
      endDate: container.dateOfClosure
        ? container.dateOfClosure.toISOString()
        : datePlusYears(container.dateOfOpening, 1),
      iterator: true,
    };

    // [step 2] Parse availability cron expressions.
    const constructedAvailabilities: object[] = [];
    for (let i = 0; i < params.availabilities.length; i++) {
      let event: Event;
      const element = params.availabilities[i];
      if (params.defaultEvent) {
        event = params.defaultEvent;
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
        constructedAvailabilities.push({
          date: dateStartTimeArr[0],
          timeOfStarting: dateStartTimeArr[1].replace('.000Z', ''),
          timeOfEnding: dateEndTimeArr[1].replace('.000Z', ''),
          eventId: event.id,
          containerId: container.id,
        });
      }
    }

    return constructedAvailabilities;
  }

  /* End */
}
