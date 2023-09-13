import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {HeatmapService} from '@microservices/event-scheduling/heatmap.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';

@ApiTags('Heatmap')
@ApiBearerAuth()
@Controller('heatmap')
export class HeatmapController {
  constructor(
    private readonly locationService: EventVenueService,
    private readonly coachService: UserService,
    private readonly heatmapService: HeatmapService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Get('coach-availability')
  @ApiQuery({name: 'locationId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  @ApiQuery({name: 'dayOfStart', type: 'number'})
  @ApiQuery({name: 'dayOfEnd', type: 'number'})
  @ApiQuery({name: 'classId', type: 'number'})
  async getCoachAvailabilityHeatmap(
    @Query()
    query: {
      locationId: number;
      year: number;
      month: number;
      dayOfStart: number;
      dayOfEnd: number;
      classId: number;
    }
  ) {
    // [step 1] Get coaches in the location.
    const coaches = await this.coachService.findMany({
      where: {profile: {locationIds: {has: query.locationId}}},
    });

    // [step 2] Get timeslots of the coaches in the month.
    const timeslots = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {
          in: coaches.map(coach => {
            return coach.id;
          }),
        },
        year: query.year,
        month: query.month,
        dayOfMonth: {gte: query.dayOfStart, lte: query.dayOfEnd},
      },
    });

    // [step 3] Count coaches for each timeslot.
    for (let i = 0; i < timeslots.length; i++) {
      const element = timeslots[i];
    }

    return await this.heatmapService.getCoachAvailabilityHeatmap(query);
  }

  @Get('customer-demand')
  @ApiQuery({name: 'locationId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  @ApiQuery({name: 'week', type: 'number'})
  @ApiQuery({name: 'classId', type: 'number'})
  async getCustomerDemandHeatmap(query: {
    year: number;
    month: number;
    location: string;
  }) {
    return await this.heatmapService.getCoachAvailabilityHeatmap(query);
  }

  /* End */
}
