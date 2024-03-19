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
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event Type')
@ApiBearerAuth()
@Controller('event-types')
export class EventTypeController {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.eventType.create({
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
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventType,
      pagination: {page, pageSize},
      findManyArgs: {where, orderBy: {id: 'asc'}},
    });
  }

  @Get(':eventTypeId')
  async getEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.prisma.eventType.findUniqueOrThrow({
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
    return await this.prisma.eventType.update({
      where: {id: eventTypeId},
      data: body,
    });
  }

  @Delete(':eventTypeId')
  async deleteEventType(
    @Param('eventTypeId') eventTypeId: number
  ): Promise<EventType> {
    return await this.prisma.eventType.delete({
      where: {id: eventTypeId},
    });
  }

  @Get('class-installments')
  async getClassInstallments() {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Tag,
      findManyArgs: {
        where: {group: {name: {contains: 'installment', mode: 'insensitive'}}},
      },
    });
  }

  /* End */
}
