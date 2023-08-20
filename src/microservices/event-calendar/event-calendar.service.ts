import {Injectable} from '@nestjs/common';
import {
  EventContainer,
  EventContainerStatus,
  Event,
  Prisma,
  EventType,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {datePlusMinutes, datePlusYears} from '@toolkit/utilities/date.util';
const CronParser = require('cron-parser');

@Injectable()
export class EventCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * *Usage scenario 1: Create calendar for single event. In this case, 'event' is required.
   * *Usage scenario 2: Create calendar for multiple events. In this case, 'event' shouldn't appear.
   */
  async createEventCalendar(params: {
    eventType?: {
      name: string;
      minutesOfDuration: number;
      minutesInAdvanceToReserve: number;
      minutesInAdanceToCancel: number;
    };
    eventContainer: {
      status: EventContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    events: [{cronExpression: string; eventTypeId?: number}];
  }): Promise<{
    eventType: EventType | undefined;
    eventContainer: EventContainer;
    events: Event[];
  }> {
    return await this.prisma.$transaction<{
      eventType: EventType | undefined;
      eventContainer: EventContainer;
      events: Event[];
    }>(async tx => {
      // [step 1] Create event container.
      const eventContainer = await tx.eventContainer.create({
        data: params.eventContainer,
      });

      // [step 2] Construct data of events.
      let newEventType: EventType | undefined;
      if (params.eventType) {
        newEventType = await tx.eventType.create({data: params.eventType});
      }
      const constructedEvents = await this.constructEvents({
        defaultEventType: newEventType,
        eventContainer: eventContainer,
        events: params.events,
      });

      // [step 3] Create events.
      await tx.event.createMany({
        data: constructedEvents as Prisma.EventCreateManyInput[],
      });

      // [step 4] Return.
      const generatedEvents = await tx.event.findMany({
        where: {containerId: eventContainer.id},
      });
      return {
        eventType: newEventType,
        eventContainer,
        events: generatedEvents,
      };
    });
  }

  /**
   * *Usage scenario 1: Update calendar for single event. In this case, 'event' is required.
   * *Usage scenario 2: Update calendar for multiple events. In this case, 'event' shouldn't appear.
   */
  async updateEventCalendar(params: {
    eventType?: {
      id: number;
      name: string;
      minutesOfDuration: number;
      minutesInAdvanceToReserve: number;
      minutesInAdanceToCancel: number;
    };
    eventContainer: {
      id: number;
      status: EventContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    events: [{cronExpression: string; eventTypeId?: number}];
  }): Promise<{
    eventType: EventType | undefined;
    eventContainer: EventContainer;
    events: Event[];
  }> {
    return await this.prisma.$transaction<{
      eventType: EventType | undefined;
      eventContainer: EventContainer;
      events: Event[];
    }>(async tx => {
      // [step 1] Delete existing events related to this container.
      await tx.event.deleteMany({
        where: {containerId: params.eventContainer.id},
      });

      // [step 2] Update event container.
      const updatedEventContainer = await tx.eventContainer.update({
        where: {id: params.eventContainer.id},
        data: params.eventContainer,
      });

      // [step 3] Construct data of events.
      let updatedEventType: EventType | undefined;
      if (params.eventType) {
        updatedEventType = await tx.eventType.update({
          where: {id: params.eventType.id},
          data: params.eventType,
        });
      }
      const constructedEvents = await this.constructEvents({
        defaultEventType: updatedEventType,
        eventContainer: updatedEventContainer,
        events: params.events,
      });

      // [step 4] Create events.
      await tx.event.createMany({
        data: constructedEvents as Prisma.EventCreateManyInput[],
      });

      // [step 5] Return.
      const generatedEvents = await tx.event.findMany({
        where: {containerId: updatedEventContainer.id},
      });
      return {
        eventType: updatedEventType,
        eventContainer: updatedEventContainer,
        events: generatedEvents,
      };
    });
  }

  /**
   * Return an event array.
   */
  private async constructEvents(params: {
    defaultEventType?: EventType;
    eventContainer: EventContainer;
    events: [{cronExpression: string; eventTypeId?: number}];
  }) {
    // [step 1] Construct the cron-parser options.
    const container = params.eventContainer;
    const cronParserOptions = {
      // ! https://unpkg.com/browse/cron-parser@4.8.1/README.md
      tz: container.timezone,
      currentDate: container.dateOfOpening.toISOString(),
      endDate: container.dateOfClosure
        ? container.dateOfClosure.toISOString()
        : datePlusYears(container.dateOfOpening, 1),
      iterator: true,
    };

    // [step 2] Parse event cron expressions.
    const constructedEvents: object[] = [];
    for (let i = 0; i < params.events.length; i++) {
      let eventType: EventType;
      const element = params.events[i];
      if (params.defaultEventType) {
        eventType = params.defaultEventType;
      } else {
        eventType = await this.prisma.eventType.findUniqueOrThrow({
          where: {id: element.eventTypeId},
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
          eventType.minutesOfDuration
        );

        const dateStartTimeArr = dateStartTime.toISOString().split('T');
        const dateEndTimeArr = dateEndTime.toISOString().split('T');

        // Construct event period data.
        constructedEvents.push({
          date: dateStartTimeArr[0],
          timeOfStarting: dateStartTimeArr[1].replace('.000Z', ''),
          timeOfEnding: dateEndTimeArr[1].replace('.000Z', ''),
          eventTypeId: eventType.id,
          containerId: container.id,
        });
      }
    }

    return constructedEvents;
  }

  /* End */
}
