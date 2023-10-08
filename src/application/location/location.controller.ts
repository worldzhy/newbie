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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
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
          timeOfDayStart: '06:30',
          timeOfDayEnd: '22:00',
          tagIds: [1, 2],
          relatedVenueIds: [1, 2],
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
  async getEventVenue(
    @Param('eventVenueId') eventVenueId: number
  ): Promise<EventVenue> {
    return await this.eventVenueService.findUniqueOrThrow({
      where: {id: eventVenueId},
    });
  }

  @Patch(':eventVenueId')
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
          timeOfDayStart: '06:30',
          timeOfDayEnd: '22:00',
          tagIds: [1, 2],
          relatedVenueIds: [1, 2],
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
  async deleteEventVenue(
    @Param('eventVenueId') eventVenueId: number
  ): Promise<EventVenue> {
    return await this.eventVenueService.delete({
      where: {id: eventVenueId},
    });
  }

  /* End */
}
