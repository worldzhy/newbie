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
import {AvailabilityTimeslot, Prisma} from '@prisma/client';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

@ApiTags('Availability Timeslot')
@ApiBearerAuth()
@Controller('availability-timeslots')
export class AvailabilityTimeslotController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          dateOfStart: '2023-09-20T00:00:00.000Z',
          timeOfStart: '1970-01-01T14:30:00.000Z',
          dateOfEnd: '2023-09-20T00:00:00.000Z',
          timeOfEnd: '1970-01-01T15:30:00.000Z',
          expressionId: 1,
        },
      },
    },
  })
  async createAvailabilityTimeslot(
    @Body() body: Prisma.AvailabilityTimeslotUncheckedCreateInput
  ): Promise<AvailabilityTimeslot> {
    return await this.availabilityTimeslotService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'availabilityExpressionId', type: 'number'})
  async getAvailabilityTimeslotes(
    @Query('availabilityExpressionId') availabilityExpressionId: number
  ): Promise<AvailabilityTimeslot[]> {
    return await this.availabilityTimeslotService.findMany({
      where: {expressionId: availabilityExpressionId},
    });
  }

  @Get(':availabilityTimeslotId')
  @ApiParam({
    name: 'availabilityTimeslotId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  async getAvailabilityTimeslot(
    @Param('availabilityTimeslotId') availabilityTimeslotId: number
  ): Promise<AvailabilityTimeslot> {
    return await this.availabilityTimeslotService.findUniqueOrThrow({
      where: {id: availabilityTimeslotId},
    });
  }

  @Patch(':availabilityTimeslotId')
  @ApiParam({
    name: 'availabilityTimeslotId',
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
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          dateOfStart: '2023-09-20T00:00:00.000Z',
          timeOfStart: '1970-01-01T14:30:00.000Z',
          dateOfEnd: '2023-09-20T00:00:00.000Z',
          timeOfEnd: '1970-01-01T15:30:00.000Z',
          expressionId: 1,
        },
      },
    },
  })
  async updateAvailabilityTimeslot(
    @Param('availabilityTimeslotId') availabilityTimeslotId: number,
    @Body()
    body: Prisma.AvailabilityTimeslotUpdateInput
  ): Promise<AvailabilityTimeslot> {
    return await this.availabilityTimeslotService.update({
      where: {id: availabilityTimeslotId},
      data: body,
    });
  }

  @Delete(':availabilityTimeslotId')
  @ApiParam({
    name: 'availabilityTimeslotId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteAvailabilityTimeslot(
    @Param('availabilityTimeslotId') availabilityTimeslotId: number
  ): Promise<AvailabilityTimeslot> {
    return await this.availabilityTimeslotService.delete({
      where: {id: availabilityTimeslotId},
    });
  }

  /* End */
}
