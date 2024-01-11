import {Controller, Query, Get, UseInterceptors} from '@nestjs/common';
import {CacheInterceptor} from '@nestjs/cache-manager';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {RawDataForecastService} from '../raw-data/raw-data-forecast.service';
import {AvailabilityService} from '@microservices/event-scheduling/availability.service';
import {daysOfMonth, daysOfWeek} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

enum HEATMAP_TYPE {
  Availability = 1,
  Demand = 2,
}
type HeatmapInfo = {type: HEATMAP_TYPE; data: User[] | number}[];

const HOUR_OF_OPENING = 5;
const HOUR_OF_CLOSURE = 22;
const MINUTES_OF_TIMESLOT = 60;

@ApiTags('Heatmap')
@ApiBearerAuth()
@Controller('heatmap')
@UseInterceptors(CacheInterceptor)
export class HeatmapController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly rawDataForecastService: RawDataForecastService
  ) {}

  @Get('days-of-month')
  getDaysOfMonth(@Query('year') year: number, @Query('month') month: number) {
    return daysOfMonth(year, month);
  }

  @Get('')
  async getHeatmap(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('weekOfMonth') weekOfMonth: number,
    @Query('types') types: (number | string)[],
    @Query('hostUserId') hostUserId: string | undefined,
    @Query('timeZone') timeZone: string
  ) {
    const heatmapInfoTimeslots: {
      year: number;
      month: number;
      dayOfMonth: number;
      dayOfWeek: number;
      hour: number;
      minute: number;
      minutesOfTimeslot: number;
      info: HeatmapInfo;
    }[] = [];

    // [step 1] Generate monthly timeslots.
    const days = daysOfWeek(year, month, weekOfMonth);
    const dateOfStart = new Date(year, month - 1, days[0].dayOfMonth);
    const dateOfEnd = new Date(
      year,
      month - 1,
      days[days.length - 1].dayOfMonth + 1
    );
    const heatmapTimeslots = this.availabilityService.generateTimeslots({
      dateOfStart,
      dateOfEnd,
      hourOfOpening: HOUR_OF_OPENING,
      hourOfClosure: HOUR_OF_CLOSURE,
      minutesOfTimeslot: MINUTES_OF_TIMESLOT,
      timeZone,
    });

    // [step 2] Prepare data for heatmap.
    const flagCoachHeatmap =
      types.includes(HEATMAP_TYPE.Availability) ||
      types.includes(HEATMAP_TYPE.Availability.toString());
    const flagDemandHeatmap =
      types.includes(HEATMAP_TYPE.Demand) ||
      types.includes(HEATMAP_TYPE.Demand.toString());
    let coaches, coachIds;
    let demands;

    // [step 2-1] Get coaches in the location.
    if (flagCoachHeatmap) {
      const where: Prisma.UserWhereInput = {
        profile: {eventVenueIds: {has: venueId}},
      };

      if (hostUserId) {
        where.id = hostUserId;
      }
      coaches = await this.prisma.user.findMany({
        where,
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
          await this.availabilityService.getTimeslotsGroupByHostUserId({
            hostUserIds: coachIds,
            venueId: venueId,
            datetimeOfStart: heatmapTimeslot.datetimeOfStart,
            datetimeOfEnd: heatmapTimeslot.datetimeOfEnd,
          });

        for (let p = 0; p < groupedAvailabilityTimeslots.length; p++) {
          const element = groupedAvailabilityTimeslots[p];
          // Check if it is seamless in the heatmap timeslot.
          // If it is seamless, then the coach is available for the heatmap timeslot.
          // ! If different availability expressions include same timeslots,
          // ! element._count.hostUserId will be larger than (MINUTES_OF_TIMESLOT / this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT)
          // ! It will cause some available coaches not appear on the heatmap.
          if (
            element._count.hostUserId ===
            MINUTES_OF_TIMESLOT /
              this.availabilityService.MINUTES_Of_TIMESLOT_UNIT
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
      let info: HeatmapInfo = [];
      const {datetimeOfEnd, datetimeOfStart, ...rest} = heatmapTimeslot;

      if (flagCoachHeatmap && flagDemandHeatmap) {
        info = [
          {type: HEATMAP_TYPE.Availability, data: availableCoaches},
          {type: HEATMAP_TYPE.Demand, data: utilization},
        ];
      } else if (flagCoachHeatmap) {
        info = [{type: HEATMAP_TYPE.Availability, data: availableCoaches}];
      } else if (flagDemandHeatmap) {
        info = [{type: HEATMAP_TYPE.Demand, data: utilization}];
      }
      heatmapInfoTimeslots.push({
        ...rest,
        info,
      });
    }

    return heatmapInfoTimeslots;
  }

  /* End */
}
