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
  EventIssueStatus,
  AvailabilityTimeslotStatus,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {
  ceilByMinutes,
  daysOfMonth,
  floorByMinutes,
} from '@toolkit/utilities/datetime.util';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventContainerService: EventContainerService
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

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    const events = await this.eventService.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
      },
    });

    // Check each issue.
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      await this.eventIssueService.checkEvent(event);
    }

    return await this.eventIssueService.findMany({
      where: {
        status: EventIssueStatus.UNREPAIRED,
        event: {
          containerId: eventContainerId,
          year: container.year,
          month: container.month,
          weekOfMonth,
        },
      },
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

    // [step 3] Modify coaches' availability status
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const newDatetimeOfStart = floorByMinutes(
        event.datetimeOfStart,
        this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT
      );
      const newDatetimeOfEnd = ceilByMinutes(
        event.datetimeOfEnd,
        this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT
      );

      await this.availabilityTimeslotService.updateMany({
        where: {
          hostUserId: event.hostUserId ?? undefined,
          datetimeOfStart: {gte: newDatetimeOfStart},
          datetimeOfEnd: {lte: newDatetimeOfEnd},
        },
        data: {status: AvailabilityTimeslotStatus.USED},
      });
    }

    return await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {status: EventContainerStatus.PUBLISHED},
    });
  }

  /* End */
}
