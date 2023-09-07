import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {Prisma, Event} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';

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
          dateOfStart: '2023-09-01',
          timeOfStart: '07:00',
          dateOfEnd: '2023-09-01',
          timeOfEnd: '07:50',
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
    return await this.eventService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getEvents(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.EventWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get events.
    return await this.eventService.findManyWithPagination(
      {where},
      {page, pageSize}
    );
  }

  @Get(':eventId')
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    description: 'The uuid of the event.',
    example: 1,
  })
  async getEvent(@Param('eventId') eventId: number) {
    return await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
    });
  }

  @Patch(':eventId')
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    description: 'The uuid of the event.',
    example: 1,
  })
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the event.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          dateOfStart: '2023-09-01',
          timeOfStart: '07:00',
          dateOfEnd: '2023-09-01',
          timeOfEnd: '07:50',
          typeId: 1,
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
  @ApiParam({
    name: 'eventId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    return await this.eventService.delete({
      where: {id: eventId},
    });
  }

  /* End */
}
