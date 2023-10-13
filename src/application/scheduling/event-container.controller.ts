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
  EventContainerOrigin,
} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {generateMonthlyCalendar} from '@toolkit/utilities/datetime.util';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {RawDataService} from '../raw-data/raw-data.service';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventContainerService: EventContainerService,
    private readonly rawDataService: RawDataService
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
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    container['calendar'] = generateMonthlyCalendar(
      container.year!,
      container.month!
    );
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

  @Get(':eventContainerId/import')
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  async importEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    // [step 1] Get target container.
    const targetContainer = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    if (targetContainer.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Get the source container we want to copy its events.
    // [step 2-1] Seach the source container in local database.
    let sourceContainer = await this.eventContainerService.findFirst({
      where: {
        year,
        month,
        venueId: targetContainer.venueId,
        status: EventContainerStatus.PUBLISHED,
      },
      include: {events: true},
    });

    // [step 2-2] Fetch origin data and create the source container.
    if (!sourceContainer) {
      await this.rawDataService.syncScheduling({
        venueId: targetContainer.venueId,
        year,
        month,
      });

      sourceContainer = await this.eventContainerService.findFirst({
        where: {
          year,
          month,
          venueId: targetContainer.venueId,
          origin: EventContainerOrigin.EXTERNAL,
          status: EventContainerStatus.PUBLISHED,
        },
        include: {events: true},
      });
    }
    if (!sourceContainer) {
      throw new BadRequestException('The history data we need is not existed.');
    }

    // [step 3] Generate events.
    const targetEvents: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    const weeksOfTargetContainer = generateMonthlyCalendar(
      targetContainer.year,
      targetContainer.month
    );
    for (let i = 0; i < weeksOfTargetContainer.length; i++) {
      targetEvents.push(
        ...this.getCopiedEvents({
          sourceContainer,
          targetContainer,
          sourceWeekNumber: 2,
          targetWeekNumber: i + 1,
        })
      );
    }

    // [step 4] Create events.
    await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {
          deleteMany: {containerId: eventContainerId},
          create: targetEvents,
        },
      },
    });
  }

  @Patch(':eventContainerId/overwrite')
  @ApiBody({
    description: 'The week number is from 1 to 6',
    examples: {
      a: {
        summary: '1. Overwrite',
        value: {
          fromWeekNumber: 1,
          toWeekNumbers: [2, 3],
        },
      },
    },
  })
  async overwriteEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Body() body: {fromWeekNumber: number; toWeekNumbers: number[]}
  ) {
    const {fromWeekNumber, toWeekNumbers} = body;

    // [step 1] Get the container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Generate events.
    const events: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    for (let i = 0; i < toWeekNumbers.length; i++) {
      events.concat(
        this.getCopiedEvents({
          sourceContainer: container,
          targetContainer: container,
          sourceWeekNumber: fromWeekNumber,
          targetWeekNumber: toWeekNumbers[i],
        })
      );
    }

    // [step 3] Create events.
    const reservedEventIds = (container['events'] as Event[]).map(event => {
      return event.id;
    });

    await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: {
        events: {
          deleteMany: {
            containerId: eventContainerId,
            id: {notIn: reservedEventIds},
          },
          create: events,
        },
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

    if (events.length === 0) {
      throw new BadRequestException('There are no classes to publish.');
    }

    // [step 2] Modify coaches' availability status
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const newDatetimeOfStart =
        this.availabilityTimeslotService.floorDatetimeOfStart(
          event.datetimeOfStart
        );
      const newDatetimeOfEnd =
        this.availabilityTimeslotService.ceilDatetimeOfEnd(event.datetimeOfEnd);

      await this.availabilityTimeslotService.updateMany({
        where: {
          hostUserId: event.hostUserId ?? undefined,
          datetimeOfStart: {gte: newDatetimeOfStart},
          datetimeOfEnd: {lte: newDatetimeOfEnd},
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

  private getCopiedEvents(params: {
    sourceContainer: EventContainer;
    targetContainer: EventContainer;
    sourceWeekNumber: number;
    targetWeekNumber: number;
  }) {
    const calendarOfTargetContainer = generateMonthlyCalendar(
      params.targetContainer.year,
      params.targetContainer.month
    );
    const calendarOfSourceContainer = generateMonthlyCalendar(
      params.sourceContainer.year,
      params.sourceContainer.month
    );
    const sourceEvents = params.sourceContainer['events'] as Event[];
    const targetEvents: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];
    const daysOfSourceWeek =
      calendarOfSourceContainer[params.sourceWeekNumber - 1];
    const daysOfTargetWeek =
      calendarOfTargetContainer[params.targetWeekNumber - 1];

    for (let j = 0; j < daysOfTargetWeek.length; j++) {
      const dayOfTargetWeek = daysOfTargetWeek[j];

      for (let m = 0; m < daysOfSourceWeek.length; m++) {
        const dayOfSourceWeek = daysOfSourceWeek[m];
        if (dayOfSourceWeek.dayOfWeek === dayOfTargetWeek.dayOfWeek) {
          for (let n = 0; n < sourceEvents.length; n++) {
            const event = sourceEvents[n];
            if (
              dayOfSourceWeek.dayOfMonth === event.dayOfMonth &&
              dayOfSourceWeek.dayOfWeek === event.dayOfWeek
            ) {
              const datetimeOfStart = event.datetimeOfStart;
              datetimeOfStart.setFullYear(dayOfTargetWeek.year);
              datetimeOfStart.setMonth(dayOfTargetWeek.month);
              datetimeOfStart.setDate(dayOfTargetWeek.dayOfMonth);

              const datetimeOfEnd = event.datetimeOfEnd;
              datetimeOfEnd.setFullYear(dayOfTargetWeek.year);
              datetimeOfEnd.setMonth(dayOfTargetWeek.month);
              datetimeOfEnd.setDate(dayOfTargetWeek.dayOfMonth);

              targetEvents.push({
                hostUserId: event.hostUserId,
                year: dayOfTargetWeek.year,
                month: dayOfTargetWeek.month,
                dayOfMonth: dayOfTargetWeek.dayOfMonth,
                dayOfWeek: dayOfTargetWeek.dayOfWeek,
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

    return targetEvents;
  }

  /* End */
}
