/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainerStatus,
  EventContainerOrigin,
  EventStatus,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import {RawDataSchedulingService} from '../raw-data/raw-data-scheduling.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Datasource} from 'src/application-solidcore/schedule/schedule.enum';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Solidcore / Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCopyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly rawDataSchedulingService: RawDataSchedulingService
  ) {}

  @Get(':eventContainerId/import')
  async importEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('weekOfMonth') weekOfMonth: number,
    @Query('datasource') datasource: Datasource
  ) {
    let fromMonth = month;
    let fromYear = year;
    const fromWeek = weekOfMonth ? weekOfMonth : 2;
    // [step 1] Get target container.
    const targetContainer = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    if (targetContainer.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('Already published.');
    }

    // [step 2] Get the source container we want to copy its events.
    // [step 2-1] Fetch from database.
    let sourceEvents: Event[] = [];

    if (datasource === Datasource.Original) {
      const sourceContainer = await this.prisma.eventContainer.findFirst({
        where: {
          year,
          month,
          venueId: targetContainer.venueId,
          origin: EventContainerOrigin.INTERNAL,
          status: EventContainerStatus.PUBLISHED,
        },
        include: {
          events: {where: {status: EventStatus.PUBLISHED, deletedAt: null}},
        },
      });
      if (sourceContainer) {
        sourceEvents = sourceContainer['events'];
      }
    }

    // [step 2-2] Fetch from snowflake .
    if (datasource === Datasource.Actual) {
      sourceEvents = await this.rawDataSchedulingService.synchronize({
        venueId: targetContainer.venueId,
        year,
        month,
      });
    }

    if (datasource === Datasource.Ai) {
      sourceEvents = await this.rawDataSchedulingService.aiPrediction({
        venueId: targetContainer.venueId,
      });
      fromMonth = moment().subtract(1, 'months').month() + 1;
      fromYear = moment().subtract(1, 'months').year();
    }

    if (sourceEvents.length <= 0) {
      throw new BadRequestException(
        'Original published schedule not found.  Please try loading the actual schedule or another month.'
      );
    }

    // [step 3] Generate events for target container.
    const targetEvents: Prisma.EventCreateManyInput[] = [];

    const weeksOfTargetContainer = daysOfMonth(
      targetContainer.year,
      targetContainer.month
    );

    for (let i = 0; i < weeksOfTargetContainer.length; i++) {
      if (weeksOfTargetContainer[i].length === 0) {
        continue;
      }

      targetEvents.push(
        ...this.eventService
          .copyMany({
            events: sourceEvents,
            from: {
              year: fromYear,
              month: fromMonth,
              week: fromWeek, // The first week may be a semi week but the 2nd week must be a full week.
            },
            to: {
              year: targetContainer.year,
              month: targetContainer.month,
              week: i + 1,
            },
          })
          .map(event => {
            event.containerId = eventContainerId;
            return event;
          })
      );
    }

    // [step 4] Delete old events and create new events.
    await this.prisma.event.deleteMany({
      where: {
        containerId: eventContainerId,
        status: EventStatus.EDITING,
      },
    });
    await this.prisma.event.createMany({data: targetEvents});
  }

  /* End */
}
