import {Controller, Patch, Post, Body, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {AvailabilityExpression, Prisma} from '@prisma/client';
import {AvailabilityService} from '@microservices/event-scheduling/availability.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly availabilityService: AvailabilityService,
    private readonly coachService: UserService
  ) {}

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
          cronExpressionsOfUnavailableTimePoints: ['0,30 11-14 20 7-9 *'],
          dateOfOpening: '2023-01-01T00:00:00.000Z',
          dateOfClosure: '2024-01-01T00:00:00.000Z',
          minutesOfDuration: 30,
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
          minutesOfDuration: 30,
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

  @Get('heatmap')
  async getCoachAvailabilityHeatmap(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    // [step 1] Get coaches in the location.
    const coaches = await this.coachService.findMany({
      where: {profile: {venueIds: {has: venueId}}},
    });

    // [step 2] Get timeslots of the coaches in the month.
    const timeslots = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {
          in: coaches.map(coach => {
            return coach.id;
          }),
        },
        year: year,
        month: month,
      },
    });

    // [step 3] Count coaches for each timeslot.
    const heatmapPoints: {
      year: number;
      month: number;
      dayOfMonth: number;
      dayOfWeek: number;
      hour: number;
      minute: number;
      minutesOfTimeslot: number;
      count: number;
    }[] = [];
    for (let i = 0; i < timeslots.length; i++) {
      const timeslot = timeslots[i];
      for (let j = 0; j < heatmapPoints.length; j++) {
        if (
          timeslot.year === heatmapPoints[j].year &&
          timeslot.month === heatmapPoints[j].month &&
          timeslot.dayOfMonth === heatmapPoints[j].dayOfMonth &&
          timeslot.hour === heatmapPoints[j].hour &&
          timeslot.minute === heatmapPoints[j].minute &&
          timeslot.minutesOfTimeslot === heatmapPoints[j].minutesOfTimeslot
        ) {
          heatmapPoints[j].count += 1;
        }
      }
      heatmapPoints.push({
        year: timeslot.year!,
        month: timeslot.month!,
        dayOfMonth: timeslot.dayOfMonth!,
        dayOfWeek: timeslot.dayOfWeek!,
        hour: timeslot.hour!,
        minute: timeslot.minute!,
        minutesOfTimeslot: timeslot.minutesOfTimeslot,
        count: 1,
      });
    }

    return heatmapPoints;
  }

  /* End */
}
