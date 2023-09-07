import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {EventType, Prisma} from '@prisma/client';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';

@ApiTags('Class')
@ApiBearerAuth()
@Controller('classes')
export class ClassController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Speaking EventType',
          minutesOfDuration: 60,
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
          numberOfSeats: 10,
        },
      },
    },
  })
  async createEventType(
    @Body() body: Prisma.EventTypeUncheckedCreateInput
  ): Promise<EventType> {
    return await this.eventTypeService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getEventTypes(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    const where: Prisma.EventTypeWhereInput = {};
    if (name && name.trim()) {
      where.name = {contains: name, mode: 'insensitive'};
    }

    return await this.eventTypeService.findManyWithPagination(
      {where},
      {page, pageSize}
    );
  }

  @Get(':eventTypeId')
  @ApiParam({
    name: 'eventTypeId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  async getEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.eventTypeService.findUniqueOrThrow({
      where: {id: eventTypeId},
    });
  }

  @Patch(':eventTypeId')
  @ApiParam({
    name: 'eventTypeId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Speaking EventType',
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
        },
      },
    },
  })
  async updateEventType(
    @Param('eventTypeId') eventTypeId: number,
    @Body()
    body: Prisma.EventTypeUpdateInput
  ): Promise<EventType> {
    return await this.eventTypeService.update({
      where: {id: eventTypeId},
      data: body,
    });
  }

  @Delete(':eventTypeId')
  @ApiParam({
    name: 'eventTypeId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.eventTypeService.delete({
      where: {id: eventTypeId},
    });
  }

  /* End */
}
