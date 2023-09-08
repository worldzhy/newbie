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
import {AvailabilityExpression, Prisma} from '@prisma/client';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';

@ApiTags('Availability Expression')
@ApiBearerAuth()
@Controller('availability-expressions')
export class AvailabilityExpressionController {
  constructor(
    private readonly availabilityExpressionService: AvailabilityExpressionService
  ) {}

  @Post('')
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
  async createAvailabilityExpression(
    @Body() body: Prisma.AvailabilityExpressionUncheckedCreateInput
  ): Promise<AvailabilityExpression> {
    return await this.availabilityExpressionService.create({
      data: body,
    });
  }

  @Get('')
  async getAvailabilityExpressiones(): Promise<AvailabilityExpression[]> {
    return await this.availabilityExpressionService.findMany({});
  }

  @Get(':availabilityExpressionId')
  @ApiParam({
    name: 'availabilityExpressionId',
    schema: {type: 'number'},
    description: '',
    example: 1,
  })
  async getAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ): Promise<AvailabilityExpression> {
    return await this.availabilityExpressionService.findUniqueOrThrow({
      where: {id: availabilityExpressionId},
    });
  }

  @Patch(':availabilityExpressionId')
  @ApiParam({
    name: 'availabilityExpressionId',
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
  async updateAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number,
    @Body()
    body: Prisma.AvailabilityExpressionUpdateInput
  ): Promise<AvailabilityExpression> {
    return await this.availabilityExpressionService.update({
      where: {id: availabilityExpressionId},
      data: body,
    });
  }

  @Delete(':availabilityExpressionId')
  @ApiParam({
    name: 'availabilityExpressionId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ): Promise<AvailabilityExpression> {
    return await this.availabilityExpressionService.delete({
      where: {id: availabilityExpressionId},
    });
  }

  /* End */
}
