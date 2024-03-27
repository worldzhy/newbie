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
  Inject,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  AvailabilityExpression,
  AvailabilityExpressionStatus,
} from '@prisma/client';
import {Request} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {JobQueueService} from '@microservices/job-queue/job-queue.service';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';
import {PrismaService} from '@toolkit/prisma/prisma.service';

enum QUARTER {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@ApiTags('Event Scheduling / Availability Expression')
@ApiBearerAuth()
@Controller('availability-expressions')
export class AvailabilityExpressionController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly jobQueueService: JobQueueService
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

    return await this.prisma.availabilityExpression.create({
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
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.AvailabilityExpression,
      pagination: {page, pageSize},
      findManyArgs: {where},
    });
  }

  @Get(':availabilityExpressionId')
  async getAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ) {
    return await this.prisma.availabilityExpression.findUniqueOrThrow({
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

    return await this.prisma.availabilityExpression.update({
      where: {id: availabilityExpressionId},
      data: availabilityExpressionUpdateInput,
    });
  }

  @Delete(':availabilityExpressionId')
  async deleteAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.delete({
      where: {id: availabilityExpressionId},
    });
  }

  @Patch(':availabilityExpressionId/process')
  async processAvailabilityExpression(
    @Param('availabilityExpressionId') availabilityExpressionId: number
  ) {
    await this.jobQueueService.addJob({availabilityExpressionId});
  }

  @Post('process')
  async processAvailabilityExpressions() {
    // [step 0] Clear useless expressions.
    await this.prisma.availabilityExpression.deleteMany({
      where: {dateOfClosure: {lt: new Date()}},
    });

    // [step 1] Get unpublished expressions.
    const exps = await this.prisma.availabilityExpression.findMany({
      where: {status: AvailabilityExpressionStatus.EDITING},
      select: {id: true},
    });

    // [step 2] Add to task queue.
    if (exps.length > 0) {
      // Clean queue jobs and http response cache.
      await this.cacheManager.reset();

      await this.jobQueueService.addJobs(
        exps.map(exp => {
          return {availabilityExpressionId: exp.id};
        })
      );
    }
  }

  /* End */
}
