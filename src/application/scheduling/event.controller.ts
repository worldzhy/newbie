import {Controller, Delete, Patch, Post, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, Event} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {datePlusMinutes} from '@toolkit/utilities/datetime.util';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

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
          minutesOfDuration: 50,
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
          minutesOfDuration: 50,
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
