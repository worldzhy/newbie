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
import {EventLocation, Prisma} from '@prisma/client';
import {EventLocationService} from '@microservices/event-scheduling/event-location.service';
import {
  generatePaginationParams,
  generatePaginationResponse,
} from '@toolkit/pagination/pagination';

@ApiTags('Event Scheduling / Location')
@ApiBearerAuth()
@Controller('event-locations')
export class EventLocationController {
  constructor(private readonly spaceService: EventLocationService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'CA, West Hollywood',
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          numberOfSeats: 20,
          minutesOfBreak: 10,
        },
      },
    },
  })
  async createEventLocation(
    @Body() body: Prisma.EventLocationUncheckedCreateInput
  ): Promise<EventLocation> {
    return await this.spaceService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getEventLocations(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.EventLocationWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 3] Get users.
    const [records, total] = await this.spaceService.findManyWithTotal({
      where: where,
      include: {tags: true},
      take: take,
      skip: skip,
    });

    return generatePaginationResponse({page, pageSize, records, total});
  }

  @Get(':eventLocationId')
  @ApiParam({
    name: 'eventLocationId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  async getEventLocation(
    @Param('eventLocationId') eventLocationId: number
  ): Promise<EventLocation> {
    return await this.spaceService.findUniqueOrThrow({
      where: {id: eventLocationId},
      include: {tags: true},
    });
  }

  @Patch(':eventLocationId')
  @ApiParam({
    name: 'eventLocationId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'CA, West Hollywood',
          address: '9001 Santa Monica Boulevard suite 103',
          city: 'West Hollywood',
          numberOfSeats: 20,
          minutesOfBreak: 10,
          tags: {set: [{id: 1}, {id: 2}]},
        },
      },
    },
  })
  async updateEventLocation(
    @Param('eventLocationId') eventLocationId: number,
    @Body()
    body: Prisma.EventLocationUpdateInput
  ): Promise<EventLocation> {
    return await this.spaceService.update({
      where: {id: eventLocationId},
      data: body,
    });
  }

  @Delete(':eventLocationId')
  @ApiParam({
    name: 'eventLocationId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteEventLocation(
    @Param('eventLocationId') eventLocationId: number
  ): Promise<EventLocation> {
    return await this.spaceService.delete({
      where: {id: eventLocationId},
    });
  }

  /* End */
}
