import {Controller, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {User} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {RawDataForecastService} from '../raw-data/raw-data-forecast.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {
  generateMonthlyCalendar,
  generateMonthlyTimeslots,
} from '@toolkit/utilities/datetime.util';

enum HEATMAP_TYPE {
  Availability = '1',
  Demand = '2',
}

const HOUR_OF_OPENING = 5;
const HOUR_OF_CLOSURE = 22;
const MINUTES_OF_TIMESLOT = 60;

@ApiTags('Heatmap')
@ApiBearerAuth()
@Controller('heatmap')
export class HeatmapController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly coachService: UserService,
    private readonly rawDataForecastService: RawDataForecastService
  ) {}

  @Get('')
  async getHeatmap(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('types') types: string[]
  ) {
    const heatmapInfoTimeslots: {
      year: number;
      month: number;
      dayOfMonth: number;
      dayOfWeek: number;
      hour: number;
      minute: number;
      minutesOfTimeslot: number;
      info: {type: HEATMAP_TYPE; data: User[] | number}[];
    }[] = [];

    // [step 1] Generate monthly timeslots.
    const heatmapTimeslots = generateMonthlyTimeslots({
      year,
      month,
      hourOfOpening: HOUR_OF_OPENING,
      hourOfClosure: HOUR_OF_CLOSURE,
      minutesOfTimeslot: MINUTES_OF_TIMESLOT,
    });

    // [step 2] Prepare data for heatmap.
    const flagCoachHeatmap = types.includes(HEATMAP_TYPE.Availability);
    const flagDemandHeatmap = types.includes(HEATMAP_TYPE.Demand);
    let coaches, coachIds;
    let demands;

    // [step 2-1] Get coaches in the location.
    if (flagCoachHeatmap) {
      coaches = await this.coachService.findMany({
        where: {profile: {eventVenueIds: {has: venueId}}},
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              coachingTenure: true,
              quotaOfWeek: true,
              quotaOfWeekMinPreference: true,
              quotaOfWeekMaxPreference: true,
            },
          },
        },
      });
      coachIds = coaches.map(coach => {
        return coach.id;
      });
    }

    // [step 2-2] Get data of demand forecasting.
    if (flagDemandHeatmap) {
      demands = await this.rawDataForecastService.forecast({
        venueId,
        year,
        month,
      });
    }

    // [step 3] Gather data in each heatmap timeslot.
    for (let i = 0; i < heatmapTimeslots.length; i++) {
      const heatmapTimeslot = heatmapTimeslots[i];

      const availableCoaches: User[] = [];
      let utilization = 0;

      if (flagCoachHeatmap) {
        // Get {hostUserId:string, _count:{}}[]
        const groupedAvailabilityTimeslots =
          await this.availabilityTimeslotService.groupByHostUserId({
            hostUserIds: coachIds,
            venueId: venueId,
            datetimeOfStart: heatmapTimeslot.datetimeOfStart,
            datetimeOfEnd: heatmapTimeslot.datetimeOfEnd,
          });

        for (let p = 0; p < groupedAvailabilityTimeslots.length; p++) {
          const element = groupedAvailabilityTimeslots[p];
          // Check if it is seamless in the heatmap timeslot.
          // If it is seamless, then the coach is available for the heatmap timeslot.
          if (
            element._count.hostUserId ===
            MINUTES_OF_TIMESLOT /
              this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT
          ) {
            for (let p = 0; p < coaches.length; p++) {
              const coach = coaches[p];
              if (coach.id === element.hostUserId) {
                availableCoaches.push(coach);
              }
            }
          }
        }
      }

      if (flagDemandHeatmap) {
        for (let q = 0; q < demands.length; q++) {
          const demandsForOneWeek = demands[q];
          for (let qq = 0; qq < demandsForOneWeek.length; qq++) {
            const demand = demandsForOneWeek[qq];
            const dataArr = demand.CLASSDATE.split('-');
            const year = parseInt(dataArr[0]);
            const month = parseInt(dataArr[1]);
            const dayOfMonth = parseInt(dataArr[2]);

            if (
              heatmapTimeslot.year === year &&
              heatmapTimeslot.month === month &&
              heatmapTimeslot.dayOfMonth === dayOfMonth &&
              heatmapTimeslot.hour === demand.startHour
            ) {
              utilization = demand.util;
            }
          }
        }
      }

      // Gather heatmap data.
      if (flagCoachHeatmap && flagDemandHeatmap) {
        heatmapInfoTimeslots.push({
          year: heatmapTimeslot.year,
          month: heatmapTimeslot.month,
          dayOfMonth: heatmapTimeslot.dayOfMonth,
          dayOfWeek: heatmapTimeslot.dayOfWeek,
          hour: heatmapTimeslot.hour,
          minute: heatmapTimeslot.minute,
          minutesOfTimeslot: heatmapTimeslot.minutesOfTimeslot,
          info: [
            {type: HEATMAP_TYPE.Availability, data: availableCoaches},
            {type: HEATMAP_TYPE.Demand, data: utilization},
          ],
        });
      } else if (flagCoachHeatmap) {
        heatmapInfoTimeslots.push({
          year: heatmapTimeslot.year,
          month: heatmapTimeslot.month,
          dayOfMonth: heatmapTimeslot.dayOfMonth,
          dayOfWeek: heatmapTimeslot.dayOfWeek,
          hour: heatmapTimeslot.hour,
          minute: heatmapTimeslot.minute,
          minutesOfTimeslot: heatmapTimeslot.minutesOfTimeslot,
          info: [{type: HEATMAP_TYPE.Availability, data: availableCoaches}],
        });
      } else {
        heatmapInfoTimeslots.push({
          year: heatmapTimeslot.year,
          month: heatmapTimeslot.month,
          dayOfMonth: heatmapTimeslot.dayOfMonth,
          dayOfWeek: heatmapTimeslot.dayOfWeek,
          hour: heatmapTimeslot.hour,
          minute: heatmapTimeslot.minute,
          minutesOfTimeslot: heatmapTimeslot.minutesOfTimeslot,
          info: [{type: HEATMAP_TYPE.Demand, data: utilization}],
        });
      }
    }

    return {
      calendar: generateMonthlyCalendar(year, month),
      heatmap: heatmapInfoTimeslots,
    };
  }

  /* End */
}
