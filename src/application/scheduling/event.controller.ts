import {Controller, Delete, Patch, Post, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, Event} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {datePlusMinutes, getWeekNumber} from '@toolkit/utilities/datetime.util';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventTypeService: EventTypeService
  ) {}

  @Post('mock-data')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create mock data',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          year: 2023,
          month: 9,
        },
      },
    },
  })
  async createMockData(
    @Body() body: {hostUserId: string; year: number; month: number}
  ) {
    console.log('- Creating events...');
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        await this.eventService.createMany({
          data: [
            {
              hostUserId: body.hostUserId,
              datetimeOfStart: '2023-09-01T06:00:00.000Z',
              datetimeOfEnd: '2023-09-01T06:50:00.000Z',
              year: body.year,
              month: body.month,
              week: getWeekNumber(body.year, body.month, 1 + i),
              dayOfMonth: 1 + i,
              dayOfWeek: (5 + i) % 7,
              hour: 6 + j,
              minute: 0,
              minutesOfDuration: 50,
              containerId: 1,
              typeId: 1,
              venueId: 1,
            },
          ],
        });
      }
    }
  }

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          year: 2023,
          month: 9,
          dayOfMonth: 1,
          dayOfWeek: 5,
          hour: 6,
          minute: 0,
          typeId: 1,
          venueId: 1,
          containerId: 1,
        },
      },
    },
  })
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput
  ): Promise<Event> {
    const eventType = await this.eventTypeService.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;

    body.datetimeOfStart = new Date(
      body.year,
      body.month - 1,
      body.dayOfMonth,
      body.hour,
      body.minute
    );
    body.datetimeOfEnd = datePlusMinutes(
      body.datetimeOfStart,
      body.minutesOfDuration
    );
    body.week = getWeekNumber(body.year, body.month, body.dayOfMonth);

    return await this.eventService.create({
      data: body,
    });
  }

  @Patch(':eventId')
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the event.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          year: 2023,
          month: 9,
          dayOfMonth: 1,
          dayOfWeek: 5,
          hour: 6,
          minute: 0,
          typeId: 1,
          venueId: 1,
          containerId: 1,
        },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUncheckedUpdateInput
  ): Promise<Event> {
    if (body.typeId) {
      const eventType = await this.eventTypeService.findUniqueOrThrow({
        where: {id: body.typeId as number},
      });
      body.minutesOfDuration = eventType.minutesOfDuration;
    }

    return await this.eventService.update({
      where: {id: eventId},
      data: body,
    });
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    return await this.eventService.delete({
      where: {id: eventId},
    });
  }

  /* End */
}
