import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  AvailabilityExpression,
  AvailabilityExpressionStatus,
} from '@prisma/client';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {Request} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {QueueService} from '@microservices/queue/queue.service';

enum QUARTER {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@ApiTags('Availability Expression')
@ApiBearerAuth()
@Controller('availability-expressions')
export class AvailabilityExpressionController {
  constructor(
    private readonly availabilityExpressionService: AvailabilityExpressionService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly accountService: AccountService,
    private readonly queueService: QueueService
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
    availabilityExpressionCreateInput.reportedAt = new Date();

    return await this.availabilityExpressionService.create({
      data: availabilityExpressionCreateInput,
    });
  }

  @Get('')
  async getAvailabilityExpressions(
    @Req() request: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('hostUserId') hostUserId?: string,
    @Query('name') name?: string,
    @Query('year') year?: number,
    @Query('quarter') quarter?: QUARTER
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.AvailabilityExpressionWhereInput | undefined;
    const whereConditions: object[] = [];

    if (hostUserId) {
      // [use case 1] called on coach setting page.
      whereConditions.push({hostUserId});
    } else {
      // [use case 2] called on upload availability page.
      if (name && name.trim()) {
        whereConditions.push({
          name: {contains: name.trim(), mode: 'insensitive'},
        });
      }
      if (year && quarter) {
        whereConditions.push({
          name: {contains: year + ' ' + quarter, mode: 'insensitive'},
        });
      }
      const user = await this.accountService.me(request);
      if (user['profile'] && user['profile'].eventVenueIds) {
        whereConditions.push({
          venueIds: {hasSome: user['profile'].eventVenueIds},
        });
      }
    }

    if (whereConditions.length > 1) {
      where = {AND: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get records.
    return await this.availabilityExpressionService.findManyInManyPages(
      {page, pageSize},
      {where}
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
    availabilityExpressionUpdateInput.status =
      AvailabilityExpressionStatus.EDITING;

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

    if (availabilityTimeslots.length === 0) {
      return;
    }

    // [step 2] Delete and create timeslots.
    await this.availabilityTimeslotService.deleteMany({
      where: {expressionId: availabilityExpressionId},
    });
    await this.availabilityTimeslotService.createMany({
      data: availabilityTimeslots,
    });

    // [step 3] Update expression status.
    return await this.availabilityExpressionService.update({
      where: {id: availabilityExpressionId},
      data: {
        status: AvailabilityExpressionStatus.PUBLISHED,
      },
    });
  }

  @Post('add-queue-jobs')
  async sendAvailabilityExpressionsToQueue() {
    // [step 1] Get unpublished expressions.
    const exps = await this.availabilityExpressionService.findMany({
      where: {status: AvailabilityExpressionStatus.EDITING},
      select: {id: true},
    });

    // [step 2] Flush the queue.
    await this.queueService.empty();
    await this.queueService.clean(1000, 'completed');
    await this.queueService.clean(1000, 'delayed');
    await this.queueService.clean(1000, 'failed');
    await this.queueService.clean(1000, 'paused');
    await this.queueService.clean(1000, 'wait');

    // [step 3] Add to task queue.
    if (exps.length > 0) {
      await this.queueService.addJobs(
        exps.map(exp => {
          return {availabilityExpressionId: exp.id};
        })
      );
    }
  }

  /* End */
}
