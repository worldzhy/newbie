import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Event, Prisma} from '@prisma/client';
import {EventService} from '../../../microservices/event-calendar/event.service';

@ApiTags('Samples: Event Calendar / Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(private readonly availabilityProviderService: EventService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Speaking Class',
          minutesOfDuration: 60,
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
          numberOfSeats: 10,
        },
      },
    },
  })
  async createEvent(
    @Body() body: Prisma.EventUncheckedCreateInput
  ): Promise<Event> {
    return await this.availabilityProviderService.create({
      data: body,
    });
  }

  @Get('')
  async getEvents(): Promise<Event[]> {
    return await this.availabilityProviderService.findMany({});
  }

  @Get(':eventId')
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  async getEvent(@Param('eventId') eventId: number): Promise<Event> {
    return await this.availabilityProviderService.findUniqueOrThrow({
      where: {id: eventId},
    });
  }

  @Patch(':eventId')
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Speaking Class',
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
        },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUpdateInput
  ): Promise<Event> {
    return await this.availabilityProviderService.update({
      where: {id: eventId},
      data: body,
    });
  }

  @Delete(':eventId')
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    return await this.availabilityProviderService.delete({
      where: {id: eventId},
    });
  }

  /* End */
}
