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
import {EventVenue, Place, Prisma} from '@prisma/client';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {PlaceService} from '@microservices/map/place.service';

@ApiTags('Location')
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
  constructor(
    private readonly eventVenueService: EventVenueService,
    private readonly placeService: PlaceService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'CA, West Hollywood',
          numberOfSeats: 20,
          minutesOfBreak: 10,
          hourOfDayStart: 6,
          hourOfDayEnd: 22,
          minuteOfDayStart: 30,
          minuteOfDayEnd: 0,
          tagIds: [1, 2],
          similarVenueIds: [1, 2],
          external_studioId: 5723396,
          external_studioName: '[solidcore] California',
          external_locationId: 1,
          // Save in place table of map module.
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          state: 'CA',
          country: 'US',
        },
      },
    },
  })
  async createEventVenue(
    @Body()
    body: Prisma.EventVenueUncheckedCreateInput &
      Prisma.PlaceUncheckedCreateInput
  ) {
    const {address, city, state, country, ...dataOfVenue} = body;
    // [step 1] Create place.
    if (address || city || state || country) {
      const place = await this.placeService.create({
        data: {address, city, state, country},
      });
      dataOfVenue.placeId = place.id;
    }

    // [step 2] Create event venue.
    const venue = await this.eventVenueService.create({
      data: dataOfVenue,
    });

    return {...venue, address, city, state, country};
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
          numberOfSeats: 20,
          minutesOfBreak: 10,
          hourOfDayStart: 6,
          hourOfDayEnd: 22,
          minuteOfDayStart: 30,
          minuteOfDayEnd: 0,
          tagIds: [1, 2],
          similarVenueIds: [1, 2],
          external_studioId: 5723396,
          external_studioName: '[solidcore] California',
          external_locationId: 1,
          // Save in place table of map module.
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          state: 'CA',
          country: 'US',
        },
      },
    },
  })
  async updateEventVenue(
    @Param('eventVenueId') eventVenueId: number,
    @Body()
    body: Prisma.EventVenueUpdateInput &
      Prisma.PlaceUncheckedUpdateInput &
      Prisma.PlaceUncheckedCreateInput
  ) {
    const {address, city, state, country, ...dataOfVenue} = body;

    // [step 1] Update event venue.
    const venue = await this.eventVenueService.update({
      where: {id: eventVenueId},
      data: dataOfVenue,
    });

    // [step 2] Update or create place.
    if (body.placeId) {
      await this.placeService.update({
        where: {id: Number(body.placeId)},
        data: {address, city, state, country},
      });
    } else {
      await this.placeService.create({
        data: {address, city, state, country},
      });
    }

    return {...venue, address, city, state, country};
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
