import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {EventCalendarService} from '../../../microservices/event-calendar/event-calendar.service';
import {AvailabilityContainerStatus} from '@prisma/client';

@ApiTags('Samples: Event Calendar')
@ApiBearerAuth()
@Controller('event-calendar')
export class EventCalendarController {
  constructor(private readonly eventCalendarService: EventCalendarService) {}

  @Post('create-event-calendar')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
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
    },
  })
  async createEventCalendar(
    @Body()
    body: {
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
    }
  ) {
    return await this.eventCalendarService.createEventCalendar(body);
  }

  @Post('set-availability-for-events')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          defaultEventId: 1,
          availabilityContainerId: 1,
          availabilities: [
            {cronExpression: '0 11 2 8 *', eventId: 1},
            {cronExpression: '0 12 3 9 *', eventId: 2},
          ],
        },
      },
    },
  })
  async setAvailabilityForEvents(
    @Body()
    body: {
      defaultEventId?: number;
      availabilityContainerId: number;
      availabilities: [{cronExpression: string; eventId?: number}];
    }
  ) {
    return await this.eventCalendarService.setAvailabilityForEvents(body);
  }

  /* End */
}
