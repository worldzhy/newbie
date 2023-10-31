import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainer,
  EventContainerStatus,
  EventContainerOrigin,
} from '@prisma/client';
import {HttpService} from '@nestjs/axios';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventTypeService: EventTypeService,
    private readonly userProfileService: UserProfileService
  ) {}

  @Get('days-of-month')
  getDaysOfMonth(@Query('year') year: number, @Query('month') month: number) {
    return daysOfMonth(year, month);
  }

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          year: 2023,
          month: 8,
          venueId: 1,
        },
      },
    },
  })
  async createEventContainer(
    @Body()
    body: Prisma.EventContainerUncheckedCreateInput
  ): Promise<EventContainer> {
    return await this.eventContainerService.create({
      data: body,
    });
  }

  @Get('')
  async getEventContainers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string,
    @Query('venueId') venueId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    // [step 1] Construct where argument.
    const where: Prisma.EventContainerWhereInput = {};
    if (name && name.trim()) where.name = name.trim();
    if (venueId) where.venueId = venueId;
    if (year) where.year = year;
    if (month) where.month = month;
    where.origin = EventContainerOrigin.INTERNAL;

    // const orderBy: Prisma.EventContainerOrderByWithRelationAndSearchRelevanceInput =
    //   {year: 'desc', month: 'desc', name: 'asc'};

    // [step 2] Get eventContainers.
    return await this.eventContainerService.findManyInManyPages(
      {page, pageSize},
      {where}
    );
  }

  @Get(':eventContainerId')
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    return await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    // Get all the coaches information
    // const coachProfiles = await this.userProfileService.findMany({
    //   select: {userId: true, fullName: true, coachingTenure: true},
    // });
    // const coachProfilesMapping = coachProfiles.reduce(
    //   (obj, item) => ({
    //     ...obj,
    //     [item.userId]: item,
    //   }),
    //   {}
    // );

    // // Get all the event types
    // const eventTypes = await this.eventTypeService.findMany({});
    // const eventTypesMapping = eventTypes.reduce(
    //   (obj, item) => ({...obj, [item.id]: item.name}),
    //   {}
    // );

    // const events = container['events'] as Event[];
    // for (let i = 0; i < events.length; i++) {
    //   const event = events[i];
    //   // Attach coach information
    //   if (event.hostUserId) {
    //     event['hostUser'] = coachProfilesMapping[event.hostUserId];
    //   } else {
    //     event['hostUser'] = {};
    //   }

    //   // Attach class type information
    //   if (event.typeId) {
    //     event['type'] = eventTypesMapping[event.typeId];
    //   } else {
    //     event['type'] = '';
    //   }
    // }

    // return container;
  }

  @Patch(':eventContainerId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          year: 2023,
          month: 8,
          venueId: 1,
        },
      },
    },
  })
  async updateEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Body()
    body: Prisma.EventContainerUncheckedUpdateInput
  ): Promise<EventContainer> {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container['events'].length > 0) {
      throw new BadRequestException('Already started to schedule.');
    }

    return await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: body,
    });
  }

  @Delete(':eventContainerId')
  async deleteEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    return await this.eventContainerService.delete({
      where: {id: eventContainerId},
    });
  }

  @Patch(':eventContainerId/publish')
  async publishEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ) {
    // [step 1] Get the record.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });
    const events = container['events'] as Event[];

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('This schedule has been published.');
    }

    if (events.length === 0) {
      throw new BadRequestException('There are no classes to publish.');
    }

    // [step 2] Post schedule to Mindbody.
    const mindbodyResponse = await this.httpService.axiosRef.post(
      'https://api.mindbodyonline.com/public/v6/class/addclassschedule',
      {
        ClassDescriptionId: 66,
        LocationId: 238,
        StartDate: '2016-03-13T12:52:32.123Z',
        EndDate: '2016-03-13T12:52:32.123Z',
        StartTime: '2016-03-13T12:52:32.123Z',
        DaySunday: true,
        DayMonday: true,
        DayTuesday: true,
        DayWednesday: true,
        DayThursday: true,
        DaySaturday: true,
        StaffId: -99,
        StaffPayRate: 1,
        ResourceId: 20,
        MaxCapacity: 20,
        PricingOptionsProductIds: [1],
        AllowDateForwardEnrollment: true,
        AllowOpenEnrollment: true,
        BookingStatus: 'Free',
        WaitlistCapacity: 1,
        WebCapacity: 1,
        DayFriday: true,
        EndTime: '2016-03-13T17:00:15Z',
      },
      {
        headers: {
          'API-Key': '479cf5d50b9642d2b5bb4f69d7ab1ec4',
          Accept: 'application/json',
          siteId: '-99',
          'Content-Type': 'application/json',
          authorization: 'authorization6',
        },
      }
    );

    console.log('$$$$$$$');
    console.log(mindbodyResponse.status);

    // [step 3] Modify coaches' availability status
    // for (let i = 0; i < events.length; i++) {
    //   const event = events[i];
    //   const newDatetimeOfStart =
    //     this.availabilityTimeslotService.floorDatetimeOfStart(
    //       event.datetimeOfStart
    //     );
    //   const newDatetimeOfEnd =
    //     this.availabilityTimeslotService.ceilDatetimeOfEnd(event.datetimeOfEnd);

    //   await this.availabilityTimeslotService.updateMany({
    //     where: {
    //       hostUserId: event.hostUserId ?? undefined,
    //       datetimeOfStart: {gte: newDatetimeOfStart},
    //       datetimeOfEnd: {lte: newDatetimeOfEnd},
    //     },
    //     data: {
    //       status: AvailabilityTimeslotStatus.USED,
    //     },
    //   });
    // }

    // return await this.eventContainerService.update({
    //   where: {id: eventContainerId},
    //   data: {status: EventContainerStatus.PUBLISHED},
    // });
  }

  /* End */
}
