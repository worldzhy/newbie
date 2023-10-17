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
  AvailabilityTimeslotStatus,
  EventContainerOrigin,
} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCheckController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventContainerService: EventContainerService
  ) {}

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ) {
    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
      const coachInfo = await this.checkCoach(event);
    }
  }

  @Get(':eventContainerId/fix')
  async fixEventContainer(@Param('eventContainerId') eventContainerId: number) {
    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
      const coachInfo = await this.checkCoach(event);
    }
  }

  async checkCoach(event: Event) {
    if (!event.hostUserId) {
      return {warning: 'The coach has not been selected.'};
    }

    const newDatetimeOfStart =
      this.availabilityTimeslotService.floorDatetimeOfStart(
        event.datetimeOfStart
      );
    const newDatetimeOfEnd = this.availabilityTimeslotService.ceilDatetimeOfEnd(
      event.datetimeOfEnd
    );

    const count = await this.availabilityTimeslotService.count({
      where: {
        hostUserId: event.hostUserId,
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });
    if (
      count <
      event.minutesOfDuration /
        this.availabilityTimeslotService.MINUTES_Of_TIMESLOT
    ) {
      return {warning: 'The coach is not available.'};
    } else {
      return null;
    }
  }

  /* End */
}
