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
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {datePlusMinutes, daysOfMonth} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService
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
    return await this.prisma.eventContainer.create({
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
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventContainer,
      pagination: {page, pageSize},
      findManyArgs: {where},
    });
  }

  @Get(':eventContainerId')
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {venue: true},
    });

    const place = await this.prisma.place.findUniqueOrThrow({
      where: {id: container['venue']['placeId'] ?? undefined},
      select: {timeZone: true},
    });

    container['venue']['timeZone'] = place.timeZone;
    return container;
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
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container['events'].length > 0) {
      throw new BadRequestException('Already started to schedule.');
    }

    return await this.prisma.eventContainer.update({
      where: {id: eventContainerId},
      data: body,
    });
  }

  @Delete(':eventContainerId')
  async deleteEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.delete({
      where: {id: eventContainerId},
    });
  }

  @Get(':eventContainerId/checkOld')
  async checkEventContainerOld(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    // Get event container.
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    const events = await this.prisma.event.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
        deletedAt: null,
      },
    });

    // Check each issue.
    for (let i = 0; i < events.length; i++) {
      await this.eventIssueService.check(events[i]);
    }

    return await this.prisma.eventIssue.findMany({
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

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    return await this.eventIssueService.checkContainer({
      eventContainerId,
      weekOfMonth,
    });
  }

  @Patch(':eventContainerId/bulk-move')
  @ApiBody({
    description: 'Bulk move events in the container.',
    examples: {
      a: {summary: '1. Move forward', value: {minutesOfMove: 15}},
      b: {summary: '1. Move backward', value: {minutesOfMove: -15}},
    },
  })
  async bulkMove(
    @Param('eventContainerId') eventContainerId: number,
    @Body()
    body: {minutesOfMove: number}
  ) {
    const events = await this.prisma.event.findMany({
      where: {
        containerId: eventContainerId,
        deletedAt: null,
        isPublished: false,
      },
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const newDatetimeOfStart = datePlusMinutes(
        event.datetimeOfStart,
        body.minutesOfMove
      );
      const newDatetimeOfEnd = datePlusMinutes(
        event.datetimeOfEnd,
        body.minutesOfMove
      );

      await this.prisma.event.update({
        where: {id: event.id},
        data: {
          datetimeOfStart: newDatetimeOfStart,
          datetimeOfEnd: newDatetimeOfEnd,
          timeZone: event.timeZone,
        },
      });
    }
  }

  @Patch(':eventContainerId/publish')
  async publishEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ) {
    // [step 1] Get the record.
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
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

    return await this.prisma.eventContainer.update({
      where: {id: eventContainerId},
      data: {status: EventContainerStatus.PUBLISHED},
    });
  }

  /* End */
}
