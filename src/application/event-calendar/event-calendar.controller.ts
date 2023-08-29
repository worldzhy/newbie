import {Controller, Post, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {EventCalendarService} from '@microservices/event-scheduling/event-calendar.service';
import {EventContainerStatus} from '@prisma/client';

@ApiTags('Event Calendar')
@ApiBearerAuth()
@Controller('event-calendar')
export class EventCalendarController {
  constructor(private readonly eventCalendarService: EventCalendarService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Calendar for single event',
        value: {
          eventType: {
            name: 'An Event',
            minutesOfDuration: 60,
            minutesInAdvanceToReserve: 120,
            minutesInAdvanceToCancel: 120,
          },
          eventContainer: {
            status: EventContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          events: [
            {cronExpression: '0 11 2 8 *'},
            {cronExpression: '0 12 3 9 *'},
          ],
        },
      },
      b: {
        summary: '2. Calendar for multiple events',
        value: {
          eventContainer: {
            status: EventContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          events: [
            {cronExpression: '0 11 2 8 *', eventTypeId: 1},
            {cronExpression: '0 12 3 9 *', eventTypeId: 2},
          ],
        },
      },
    },
  })
  async createEventCalendar(
    @Body()
    body: {
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
    }
  ) {
    return await this.eventCalendarService.createEventCalendar(body);
  }

  @Patch('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Calendar for single event',
        value: {
          eventType: {
            id: 1,
            name: 'An Event',
            minutesOfDuration: 60,
            minutesInAdvanceToReserve: 120,
            minutesInAdvanceToCancel: 120,
          },
          eventContainer: {
            id: 1,
            status: EventContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          events: [
            {cronExpression: '0 11 2 8 *'},
            {cronExpression: '0 12 3 9 *'},
          ],
        },
      },
      b: {
        summary: '2. Calendar for multiple events',
        value: {
          eventContainer: {
            id: 1,
            status: EventContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          events: [
            {cronExpression: '0 11 2 8 *', eventTypeId: 1},
            {cronExpression: '0 12 3 9 *', eventTypeId: 2},
          ],
        },
      },
    },
  })
  async updateEventCalendar(
    @Body()
    body: {
      eventType?: {
        id: number;
        name: string;
        minutesOfDuration: number;
        minutesInAdvanceToReserve: number;
        minutesInAdanceToCancel: number;
      };
      eventContainer: {
        id: 1;
        status: EventContainerStatus;
        dateOfOpening: Date;
        dateOfClosure: Date;
        timezone: string;
      };
      events: [{cronExpression: string; eventTypeId?: number}];
    }
  ) {
    return await this.eventCalendarService.updateEventCalendar(body);
  }
  /* End */
}
