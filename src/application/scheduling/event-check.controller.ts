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
  async checkEventContainer() {}

  /* End */
}
