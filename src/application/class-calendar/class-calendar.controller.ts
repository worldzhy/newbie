import {Controller, Post, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {EventCalendarService} from '../../microservices/event-calendar/event-calendar.service';
import {AvailabilityContainerStatus} from '@prisma/client';

@ApiTags('Class Calendar')
@ApiBearerAuth()
@Controller('class-calendar')
export class ClassCalendarController {
  constructor(private readonly eventCalendarService: EventCalendarService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Calendar for single event',
        value: {
          event: {
            name: 'An Event',
            minutesOfDuration: 60,
            minutesInAdvanceToReserve: 120,
            minutesInAdvanceToCancel: 120,
            numberOfSeats: 10,
          },
          availabilityContainer: {
            status: AvailabilityContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          availabilities: [
            {cronExpression: '0 11 2 8 *'},
            {cronExpression: '0 12 3 9 *'},
          ],
        },
      },
      b: {
        summary: '2. Calendar for multiple events',
        value: {
          availabilityContainer: {
            status: AvailabilityContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          availabilities: [
            {cronExpression: '0 11 2 8 *', eventId: 1},
            {cronExpression: '0 12 3 9 *', eventId: 2},
          ],
        },
      },
    },
  })
  async createClassCalendar(
    @Body()
    body: {
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
          event: {
            id: 1,
            name: 'An Event',
            minutesOfDuration: 60,
            minutesInAdvanceToReserve: 120,
            minutesInAdvanceToCancel: 120,
            numberOfSeats: 10,
          },
          availabilityContainer: {
            id: 1,
            status: AvailabilityContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          availabilities: [
            {cronExpression: '0 11 2 8 *'},
            {cronExpression: '0 12 3 9 *'},
          ],
        },
      },
      b: {
        summary: '2. Calendar for multiple events',
        value: {
          availabilityContainer: {
            id: 1,
            status: AvailabilityContainerStatus.ACTIVE,
            dateOfOpening: '2020-12-12',
            dateOfClosure: '2021-12-12',
            timezone: 'Europe/Athens',
          },
          availabilities: [
            {cronExpression: '0 11 2 8 *', eventId: 1},
            {cronExpression: '0 12 3 9 *', eventId: 2},
          ],
        },
      },
    },
  })
  async updateClassCalendar(
    @Body()
    body: {
      event?: {
        id: number;
        name: string;
        minutesOfDuration: number;
        minutesInAdvanceToReserve: number;
        minutesInAdanceToCancel: number;
        numberOfSeats: number;
      };
      availabilityContainer: {
        id: 1;
        status: AvailabilityContainerStatus;
        dateOfOpening: Date;
        dateOfClosure: Date;
        timezone: string;
      };
      availabilities: [{cronExpression: string; eventId?: number}];
    }
  ) {
    return await this.eventCalendarService.updateEventCalendar(body);
  }
  /* End */
}
