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
import {EventVenue, Prisma} from '@prisma/client';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';

@ApiTags('Location')
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
  constructor(private readonly eventVenueService: EventVenueService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'CA, West Hollywood',
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          numberOfSeats: 20,
          minutesOfBreak: 10,
          tagIds: [1, 2],
        },
      },
    },
  })
  async createEventVenue(
    @Body() body: Prisma.EventVenueUncheckedCreateInput
  ): Promise<EventVenue> {
    return await this.eventVenueService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getEventVenues(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.EventVenueWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name, mode: 'insensitive'}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get users.
    return await this.eventVenueService.findManyWithPagination(
      {where},
      {page, pageSize}
    );
  }

  @Get(':eventVenueId')
  @ApiParam({
    name: 'eventVenueId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  async getEventVenue(
    @Param('eventVenueId') eventVenueId: number
  ): Promise<EventVenue> {
    return await this.eventVenueService.findUniqueOrThrow({
      where: {id: eventVenueId},
    });
  }

  @Patch(':eventVenueId')
  @ApiParam({
    name: 'eventVenueId',
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
          name: 'CA, West Hollywood',
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          numberOfSeats: 20,
          minutesOfBreak: 10,
          tags: {set: [{id: 1}, {id: 2}]},
        },
      },
    },
  })
  async updateEventVenue(
    @Param('eventVenueId') eventVenueId: number,
    @Body()
    body: Prisma.EventVenueUpdateInput
  ): Promise<EventVenue> {
    return await this.eventVenueService.update({
      where: {id: eventVenueId},
      data: body,
    });
  }

  @Delete(':eventVenueId')
  @ApiParam({
    name: 'eventVenueId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEventVenue(
    @Param('eventVenueId') eventVenueId: number
  ): Promise<EventVenue> {
    return await this.eventVenueService.delete({
      where: {id: eventVenueId},
    });
  }

  /* End */
}
