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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
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
          tagId: 1,
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
  async getEventTypes(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    let where: Prisma.EventTypeWhereInput | undefined = undefined;
    if (name && name.trim()) {
      where = {name: {contains: name.trim(), mode: 'insensitive'}};
    }
    return await this.eventTypeService.findManyInManyPages(
      {page, pageSize},
      {where, orderBy: {id: 'asc'}}
    );
  }

  @Get(':eventTypeId')
  async getEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.eventTypeService.findUniqueOrThrow({
      where: {id: eventTypeId},
    });
  }

  @Patch(':eventTypeId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Speaking EventType',
          tagId: 2,
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
  async deleteEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.eventTypeService.delete({
      where: {id: eventTypeId},
    });
  }

  /* End */
}
