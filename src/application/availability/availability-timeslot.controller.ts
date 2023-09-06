import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
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
          name: 'Speaking AvailabilityTimeslot',
          minutesOfDuration: 60,
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
          numberOfSeats: 10,
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
  async getAvailabilityTimeslotes(): Promise<AvailabilityTimeslot[]> {
    return await this.availabilityTimeslotService.findMany({});
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
          name: 'Speaking AvailabilityTimeslot',
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
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
