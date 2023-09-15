import {Controller, Patch, Post, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {AvailabilityExpression, Prisma} from '@prisma/client';
import {AvailabilityService} from '@microservices/event-scheduling/availability.service';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('expression2timeslots')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          cronExpressionsOfAvailableTimePoints: [
            '0,30 11-14 * 7-9 1,3,5',
            '0,30 11-14 * 7-9 2,4,6',
          ],
          cronExpressionsOfUnavailableTimePoints: ['0,30 11-14 20 9 *'],
          dateOfOpening: '2023-01-01T00:00:00.000Z',
          dateOfClosure: '2024-01-01T00:00:00.000Z',
          minutesOfTimeslot: 30,
        },
      },
    },
  })
  async createExpression2Timeslots(
    @Body() body: Prisma.AvailabilityExpressionUncheckedCreateInput
  ): Promise<AvailabilityExpression> {
    return await this.availabilityService.create(body);
  }

  @Patch('expression2timeslots')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          cronExpressionsOfAvailableTimePoints: [
            '0,30 11-14 * 7-9 1,3,5',
            '0,30 11-14 * 7-9 2,4,6',
          ],
          cronExpressionsOfUnavailableTimePoints: ['0,30 11-14 20 9 *'],
          dateOfOpening: '2023-01-01T00:00:00.000Z',
          dateOfClosure: '2024-01-01T00:00:00.000Z',
          minutesOfTimeslot: 30,
        },
      },
    },
  })
  async updateExpression2Timeslots(
    @Query('availabilityExpressionId') availabilityExpressionId: number,
    @Body()
    body: Prisma.AvailabilityExpressionUpdateInput
  ): Promise<AvailabilityExpression> {
    return await this.availabilityService.update(
      availabilityExpressionId,
      body
    );
  }

  /* End */
}
