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
   * *Usage scenario 1: Create calendar for single event type. In this case, 'eventTypeId' is required.
   * *Usage scenario 2: Create calendar for multiple event types. In this case, 'eventTypeId' shouldn't appear.
   */
  async createEventCalendar(params: {
    eventTypeId?: number;
    eventContainer: {
      status: EventContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    events: [{cronExpression: string; eventTypeId?: number}];
  }): Promise<{
    eventContainer: EventContainer;
    events: Event[];
  }> {
    return await this.prisma.$transaction<{
      eventContainer: EventContainer;
      events: Event[];
    }>(async tx => {
      // [step 1] Create event container.
      const eventContainer = await tx.eventContainer.create({
        data: params.eventContainer,
      });

      // [step 2] Construct data of events.
      let eventType: EventType | undefined;
      if (params.eventTypeId) {
        eventType = await tx.eventType.findUniqueOrThrow({
          where: {id: params.eventTypeId},
        });
      }
      const constructedEvents = await this.constructEvents({
        defaultEventType: eventType,
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
      return {eventContainer, events: generatedEvents};
    });
  }

  /**
   * *Usage scenario 1: Update calendar for single event type. In this case, 'event' is required.
   * *Usage scenario 2: Update calendar for multiple events. In this case, 'event' shouldn't appear.
   */
  async updateEventCalendar(params: {
    eventTypeId?: number;
    eventContainer: {
      id: number;
      status: EventContainerStatus;
      dateOfOpening: Date;
      dateOfClosure: Date;
      timezone: string;
    };
    events: [{cronExpression: string; eventTypeId?: number}];
  }): Promise<{
    eventContainer: EventContainer;
    events: Event[];
  }> {
    return await this.prisma.$transaction<{
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
      let eventType: EventType | undefined;
      if (params.eventTypeId) {
        eventType = await tx.eventType.findUniqueOrThrow({
          where: {id: params.eventTypeId},
        });
      }
      const constructedEvents = await this.constructEvents({
        defaultEventType: eventType,
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
      currentDate: container.dateOfOpening!.toISOString(),
      endDate: container.dateOfClosure
        ? container.dateOfClosure.toISOString()
        : datePlusYears(container.dateOfOpening!, 1),
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
