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
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {Prisma, EventContainer} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {parseDaysOfMonth} from '@toolkit/utilities/date.util';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(private eventContainerService: EventContainerService) {}

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
  @ApiQuery({name: 'locationId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
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
  @ApiParam({
    name: 'eventContainerId',
    schema: {type: 'number'},
    description: 'The uuid of the eventContainer.',
    example: 1,
  })
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    container['calendar'] = parseDaysOfMonth(container.year!, container.month!);
    return container;
  }

  @Patch(':eventContainerId')
  @ApiParam({
    name: 'eventContainerId',
    schema: {type: 'number'},
    description: 'The uuid of the eventContainer.',
    example: 1,
  })
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

  @Delete(':eventContainerId')
  @ApiParam({
    name: 'eventContainerId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    return await this.eventContainerService.delete({
      where: {id: eventContainerId},
    });
  }

  /* End */
}
