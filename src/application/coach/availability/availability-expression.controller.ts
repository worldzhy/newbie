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
import {
  Prisma,
  AvailabilityExpression,
  AvailabilityExpressionStatus,
} from '@prisma/client';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

@ApiTags('Availability Expression')
@ApiBearerAuth()
@Controller('availability-expressions')
export class AvailabilityExpressionController {
  constructor(
    private availabilityExpressionService: AvailabilityExpressionService,
    private availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          venueIds: [1, 2],
          cronExpressionsOfAvailableTimePoints: [
            '0,30 11-14 * 7-9 1,3,5',
            '0,30 11-14 * 7-9 2,4,6',
          ],
          cronExpressionsOfUnavailableTimePoints: ['0,30 11-14 20 7-9 *'],
          dateOfOpening: '2023-01-01T00:00:00.000Z',
          dateOfClosure: '2024-01-01T00:00:00.000Z',
          minutesOfDuration: 30,
        },
      },
    },
  })
  async createAvailabilityExpression(
    @Body()
    body: Prisma.AvailabilityExpressionCreateInput
  ): Promise<AvailabilityExpression> {
    const availabilityExpressionCreateInput: Prisma.AvailabilityExpressionCreateInput =
      body;

    return await this.availabilityExpressionService.create({
      data: availabilityExpressionCreateInput,
    });
  }

  @Get('')
  async getAvailabilityExpressions(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('hostUserId') hostUserId?: string
  ) {
    return await this.availabilityExpressionService.findManyInManyPages(
      {page, pageSize},
      {where: {hostUserId}}
    );
  }

  @Get(':availabilityExpressionId')
  async getAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ) {
    return await this.availabilityExpressionService.findUniqueOrThrow({
      where: {id: availabilityExpressionId},
    });
  }

  @Patch(':availabilityExpressionId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          venueIds: [1, 2],
          cronExpressionsOfAvailableTimePoints: [
            '0,30 11-14 * 7-9 1,3,5',
            '0,30 11-14 * 7-9 2,4,6',
          ],
          cronExpressionsOfUnavailableTimePoints: ['0,30 11-14 20 9 *'],
          dateOfOpening: '2023-01-01T00:00:00.000Z',
          dateOfClosure: '2024-01-01T00:00:00.000Z',
          minutesOfDuration: 30,
        },
      },
    },
  })
  async updateAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number,
    @Body()
    body: Prisma.AvailabilityExpressionUpdateInput
  ): Promise<AvailabilityExpression> {
    const availabilityExpressionUpdateInput: Prisma.AvailabilityExpressionUpdateInput =
      body;

    return await this.availabilityExpressionService.update({
      where: {id: availabilityExpressionId},
      data: availabilityExpressionUpdateInput,
    });
  }

  @Delete(':availabilityExpressionId')
  async deleteAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ): Promise<AvailabilityExpression> {
    return await this.availabilityExpressionService.delete({
      where: {id: availabilityExpressionId},
    });
  }

  @Patch(':availabilityExpressionId/parse')
  async parseAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ) {
    // [step 1] Parse expression to timeslots.
    const availabilityTimeslots =
      await this.availabilityExpressionService.parse(availabilityExpressionId);

    // [step 2] Delete and create timeslots.
    await this.availabilityTimeslotService.deleteMany({
      where: {expressionId: availabilityExpressionId},
    });
    await this.availabilityTimeslotService.createMany({
      data: availabilityTimeslots,
    });

    // [step 3] Update expression status.
    return this.availabilityExpressionService.update({
      where: {id: availabilityExpressionId},
      data: {
        status: AvailabilityExpressionStatus.PUBLISHED,
      },
    });
  }

  /* End */
}
