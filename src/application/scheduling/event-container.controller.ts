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
import {ApiTags, ApiBearerAuth, ApiBody, ApiQuery} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainer,
  EventContainerStatus,
  AvailabilityTimeslotStatus,
} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {parseDaysOfMonth} from '@toolkit/utilities/date.util';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private availabilityTimeslotService: AvailabilityTimeslotService,
    private eventContainerService: EventContainerService
  ) {}

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

  @Public()
  @Get('')
  async getEventContainers(
    @Query('name') name?: string,
    @Query('venueId') venueId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    const where: Prisma.EventContainerWhereInput = {};
    if (name && name.trim()) where.name = name.trim();
    if (venueId) where.venueId = venueId;
    if (year) where.year = year;
    if (month) where.month = month;

    // [step 2] Get eventContainers.
    return await this.eventContainerService.findManyWithPagination(
      {where},
      {page, pageSize}
    );
  }

  @Get(':eventContainerId')
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    container['calendar'] = parseDaysOfMonth(container.year!, container.month!);
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

  @Patch(':eventContainerId/import')
  @ApiQuery({name: 'fromContainerId', type: 'number'})
  async importEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('fromContainerId') fromContainerId: number
  ) {
    // [step 1] Get the container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Get the container we want to use its events.
    const fromContainer = await this.eventContainerService.findUniqueOrThrow({
      where: {id: fromContainerId},
      include: {events: true},
    });

    // [step 3] Generate events with strategy
    const events = this.generateEventsStrategy(container, fromContainer);
    await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {deleteMany: {containerId: eventContainerId}, create: events},
      },
    });
  }

  @Get(':eventContainerId/check')
  async checkEventContainer() {}

  @Patch(':eventContainerId/publish')
  async publishEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    // [step 1] Get the record.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });
    const events = container['events'] as Event[];

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('This scheduling has been published.');
    }

    if (events.length > 0) {
      throw new BadRequestException('There are no classes to publish.');
    }

    // [step 2] Modify coaches' availability status
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      await this.availabilityTimeslotService.updateMany({
        where: {
          hostUserId: event.hostUserId,
          datetimeOfStart: {gte: event.datetimeOfStart},
          datetimeOfEnd: {lte: event.datetimeOfEnd},
        },
        data: {
          status: AvailabilityTimeslotStatus.USED,
        },
      });
    }

    return await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {status: EventContainerStatus.PUBLISHED},
    });
  }

  private generateEventsStrategy(
    container: EventContainer,
    fromContainer: EventContainer
  ) {
    const calendarOfContainer = parseDaysOfMonth(
      container.year,
      container.month
    );
    const calendarOfFromContainer = parseDaysOfMonth(
      fromContainer.year,
      fromContainer.month
    );
    const fromEvents = fromContainer['events'] as Event[];
    const events: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    const daysOfThat2ndWeek = calendarOfFromContainer[1];

    for (let i = 0; i < calendarOfContainer.length; i++) {
      const daysOfThisWeek = calendarOfContainer[i];
      for (let j = 0; j < daysOfThisWeek.length; j++) {
        const dayOfThisWeek = daysOfThisWeek[j];

        for (let m = 0; m < daysOfThat2ndWeek.length; m++) {
          const dayOfThat2ndWeek = daysOfThat2ndWeek[m];
          if (dayOfThat2ndWeek.dayOfWeek === dayOfThisWeek.dayOfWeek) {
            for (let n = 0; n < fromEvents.length; n++) {
              const event = fromEvents[n];
              if (
                dayOfThat2ndWeek.dayOfMonth === event.dayOfMonth &&
                dayOfThat2ndWeek.dayOfWeek === event.dayOfWeek
              ) {
                const datetimeOfStart = event.datetimeOfStart;
                datetimeOfStart.setFullYear(dayOfThisWeek.year);
                datetimeOfStart.setMonth(dayOfThisWeek.month);
                datetimeOfStart.setDate(dayOfThisWeek.dayOfMonth);

                const datetimeOfEnd = event.datetimeOfEnd;
                datetimeOfEnd.setFullYear(dayOfThisWeek.year);
                datetimeOfEnd.setMonth(dayOfThisWeek.month);
                datetimeOfEnd.setDate(dayOfThisWeek.dayOfMonth);

                events.push({
                  hostUserId: event.hostUserId,
                  year: dayOfThisWeek.year,
                  month: dayOfThisWeek.month,
                  dayOfMonth: dayOfThisWeek.dayOfMonth,
                  dayOfWeek: dayOfThisWeek.dayOfWeek,
                  hour: event.hour,
                  minute: event.minute,
                  minutesOfDuration: event.minutesOfDuration,
                  datetimeOfStart: datetimeOfStart,
                  datetimeOfEnd: datetimeOfEnd,
                  typeId: event.typeId,
                  venueId: event.venueId,
                });
              }
            }
          }
        }
      }
    }

    return events;
  }

  /* End */
}
