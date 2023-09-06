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
            '0 0,30 18,19,20 ? 7,8,9 1 2023-2023',
            '0 0,30 18,19,20 ? 7,8,9 3 2023-2023',
            '0 0,30 18,19,20 ? 7,8,9 5 2023-2023',
          ],
          cronExpressionsOfUnavailableTimePoints: [
            '0 0,30 18 19 9 ? 2023-2023',
          ],
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
            '0 0,30 18,19,20 ? 7,8,9 1 2023-2023',
            '0 0,30 18,19,20 ? 7,8,9 3 2023-2023',
            '0 0,30 18,19,20 ? 7,8,9 5 2023-2023',
          ],
          cronExpressionsOfUnavailableTimePoints: [
            '0 0,30 18 19 9 ? 2023-2023',
          ],
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
