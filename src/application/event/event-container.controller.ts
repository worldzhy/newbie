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
  EventContainer,
  EventContainerStatus,
  AvailabilityTimeslotStatus,
} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {parseDaysOfMonth} from '@toolkit/utilities/date.util';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

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

  @Get('')
  async getEventContainers(
    @Query('locationId') locationId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    const where: Prisma.EventContainerWhereInput = {
      year,
      month,
      venueId: locationId,
    };

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
    const container = this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container['events'].length > 0) {
      throw new BadRequestException('Delete it and create a new one.');
    }

    return await this.eventContainerService.update({
      where: {id: eventContainerId},
      data: body,
    });
  }

  @Patch(':eventContainerId/publish')
  async publishEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    // [step 1] Get the record.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container.status === EventContainerStatus.PUBLISHED) {
      throw new BadRequestException('This scheduling has been published.');
    }

    if (container['events'].length > 0) {
      throw new BadRequestException('There are no classes to publish.');
    }

    // [step 2] Modify coaches' availability status
    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
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

  @Delete(':eventContainerId')
  async deleteEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    return await this.eventContainerService.delete({
      where: {id: eventContainerId},
    });
  }

  @Post('import')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Import',
        value: {
          fromContainerId: 1,
          toContainerId: 2,
        },
      },
    },
  })
  async importEventContainer(
    @Body()
    body: {
      fromContainerId: number;
      toContainerId: number;
    }
  ) {
    const container = this.eventContainerService.findUniqueOrThrow({
      where: {id: body.fromContainerId},
      include: {events: true},
    });

    if (container['events'].length > 0) {
      throw new BadRequestException('Delete it and create a new one.');
    }
  }

  /* End */
}
