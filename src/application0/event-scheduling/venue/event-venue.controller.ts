import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {EventVenue, Place, Prisma} from '@prisma/client';
import {AccountService} from '@microservices/account/account.service';
import {Request} from 'express';
import {RoleService} from '@microservices/account/role.service';
import * as _ from 'lodash';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event Venue')
@ApiBearerAuth()
@Controller('event-venues')
export class EventVenueController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService
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
          // Save in place table of map module.
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          state: 'CA',
          country: 'US',
          timeZone: 'Asia/Shanghai',
        },
      },
    },
  })
  async createEventVenue(
    @Body()
    body: Prisma.EventVenueUncheckedCreateInput &
      Prisma.PlaceUncheckedCreateInput
  ) {
    const {address, city, state, country, timeZone, ...dataOfVenue} = body;
    // [step 1] Create place.
    if (address || city || state || country || timeZone) {
      const place = await this.prisma.place.create({
        data: {address, city, state, country, timeZone},
      });
      dataOfVenue.placeId = place.id;
    }

    // [step 2] Create event venue.
    const venue = await this.prisma.eventVenue.create({
      data: dataOfVenue,
    });

    return {...venue, address, city, state, country, timeZone};
  }

  @Get('')
  async getEventVenues(
    @Req() request: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.EventVenueWhereInput | undefined;
    const whereConditions: object[] = [];

    const user = await this.accountService.me(request);
    if (await this.roleService.isAdmin(user.id)) {
      // Get all the locations.
    } else {
      whereConditions.push({id: {in: user.profile?.eventVenueIds}});
    }

    if (name) {
      name = name.trim();
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get event venues.
    const venues = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventVenue,
      pagination: {page, pageSize},
      findManyArgs: {where},
    });

    // [step 3] Attach place information Optimization.
    const venuePlaceIds = venues.records.map((d: any) => d.placeId);
    const places = await this.prisma.place.findMany({
      where: {
        id: {in: venuePlaceIds},
      },
      select: {
        id: true,
        address: true,
        state: true,
        city: true,
        country: true,
        timeZone: true,
      },
    });

    venues.records.forEach((venue: EventVenue & Place) => {
      const place: any = _.find(places, (p: Place) => {
        return p.id === (venue.placeId as number);
      });

      if (place) {
        venue.address = place.address;
        venue.city = place.city;
        venue.state = place.state;
        venue.country = place.country;
        venue.timeZone = place.timeZone;
      }
    });

    return venues;
  }

  @Get(':eventVenueId')
  async getEventVenue(@Param('eventVenueId') eventVenueId: number) {
    // [step 1] Get venue.
    const venue = (await this.prisma.eventVenue.findUniqueOrThrow({
      where: {id: eventVenueId},
    })) as EventVenue & Place;

    // [step 2] Attach place information.
    if (venue.placeId) {
      const place = await this.prisma.place.findUnique({
        where: {id: venue.placeId},
      });
      if (place) {
        venue.address = place.address;
        venue.city = place.city;
        venue.state = place.state;
        venue.country = place.country;
        venue.timeZone = place.timeZone;
      }
    }

    return venue;
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
          preferredProgramId: 1,
          external_studioId: 5723396,
          external_studioName: '[solidcore] California',
          external_locationId: 1,
          external_resourceId: 1,
          external_staffPayRate: 10,
          external_maxCapacity: 20,
          external_pricingOptionsProductIds: [1],
          external_allowDateForwardEnrollment: true,
          external_allowOpenEnrollment: true,
          external_bookingStatus: '',
          external_waitlistCapacity: 10,
          external_webCapacity: 10,
          // Save in place table of map module.
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          state: 'CA',
          country: 'US',
          timeZone: 'Asia/Shanghai',
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
    const {address, city, state, country, timeZone, ...dataOfVenue} = body;

    // [step 1] Update event venue.
    const venue = await this.prisma.eventVenue.update({
      where: {id: eventVenueId},
      data: dataOfVenue,
    });

    // [step 2] Update or create place.
    await this.prisma.place.upsert({
      where: {id: venue.placeId ?? undefined},
      update: {address, city, state, country, timeZone},
      create: {address, city, state, country, timeZone},
    });

    return {...venue, address, city, state, country, timeZone};
  }

  @Delete(':eventVenueId')
  async deleteEventVenue(
    @Param('eventVenueId') eventVenueId: number
  ): Promise<EventVenue> {
    return await this.prisma.eventVenue.delete({
      where: {id: eventVenueId},
    });
  }

  /* End */
}
