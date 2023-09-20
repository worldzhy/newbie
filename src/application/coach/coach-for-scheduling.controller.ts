import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {datePlusMinutes} from '@toolkit/utilities/date.util';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches-for-scheduling')
export class CoachForSchedulingController {
  private minutesOfTimeslot: number;
  constructor(
    private userService: UserService,
    private availabilityTimeslotService: AvailabilityTimeslotService
  ) {
    this.minutesOfTimeslot = this.availabilityTimeslotService.minutesOfTimeslot;
  }

  @Get('')
  async getUsersForScheduling(
    @Query('venueId') venueId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('dayOfMonth') dayOfMonth?: number,
    @Query('hour') hour?: number,
    @Query('minute') minute?: number,
    @Query('minutesOfDuration') minutesOfDuration?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];

    whereConditions.push({roles: {some: {name: ROLE_NAME_COACH}}});
    if (venueId) {
      whereConditions.push({profile: {venueIds: {has: venueId}}});
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get coaches for the specific venue.
    const coaches = await this.userService.findMany({
      where: where,
      include: {profile: true},
    });

    // [step 3] Filter coaches.
    const filteredCoachIds: string[] = [];
    if (
      year &&
      month &&
      dayOfMonth &&
      hour &&
      minute !== undefined &&
      minutesOfDuration
    ) {
      // [step 3-1] Get availabilities.
      const datetimeOfStart = new Date(
        year,
        month - 1,
        dayOfMonth,
        hour,
        minute
      );
      const datetimeOfEnd = datePlusMinutes(datetimeOfStart, minutesOfDuration);
      const newDatetimeOfStart =
        this.availabilityTimeslotService.floorDatetimeOfStart(datetimeOfStart);
      const newDatetimeOfEnd =
        this.availabilityTimeslotService.ceilDatetimeOfEnd(datetimeOfEnd);

      const coachIds = coaches.map(coach => {
        return coach.id;
      });
      const availabilities = await this.availabilityTimeslotService.findMany({
        where: {
          hostUserId: {in: coachIds},
          datetimeOfStart: {gte: newDatetimeOfStart},
          datetimeOfEnd: {lte: newDatetimeOfEnd},
        },
      });

      // [step 3-2] Filter coaches.
      for (let i = 0; i < coachIds.length; i++) {
        const coachId = coachIds[i];
        const tmpAvailabilities = availabilities.filter(availability => {
          return availability.hostUserId === coachId;
        });
        if (
          tmpAvailabilities.length >=
          minutesOfDuration / this.minutesOfTimeslot
        ) {
          filteredCoachIds.push(coachId);
        }
      }
    }

    // [step 4] Return users without password.
    const finalCoaches: object[] = [];
    coaches.forEach(coach => {
      if (filteredCoachIds.includes(coach.id)) {
        finalCoaches.push(this.userService.withoutPassword(coach));
      }
    });
    return finalCoaches;
  }
  /* End */
}
