import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {datePlusMinutes, getWeekNumber} from '@toolkit/utilities/datetime.util';
import {UserService} from '@microservices/account/user/user.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {CoachService} from './coach.service';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('event-coaches')
export class EventCoachController {
  constructor(
    private readonly coachService: CoachService,
    private readonly classTypeService: EventTypeService,
    private readonly userService: UserService
  ) {}

  @Get('')
  async getCoachesForEvent(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('dayOfMonth') dayOfMonth?: number,
    @Query('hour') hour?: number,
    @Query('minute') minute?: number,
    @Query('typeId') typeId?: number
  ) {
    // [step 1] There are enough conditions to get sorted coaches.
    if (
      venueId &&
      typeId &&
      year &&
      month &&
      dayOfMonth &&
      hour &&
      minute != undefined
    ) {
      const classType = await this.classTypeService.findUniqueOrThrow({
        where: {id: typeId},
      });
      const datetimeOfStart = new Date(
        year,
        month - 1,
        dayOfMonth,
        hour,
        minute
      );
      const datetimeOfEnd = datePlusMinutes(
        datetimeOfStart,
        classType.minutesOfDuration
      );
      const event = {
        venueId,
        typeId,
        datetimeOfStart,
        datetimeOfEnd,
        year,
        month,
        week: getWeekNumber(year, month, dayOfMonth),
        minutesOfDuration: classType.minutesOfDuration,
      };
      return await this.coachService.getSortedCoachesForEvent(event);
    }

    // [step 2] There are enough conditions to get sorted coaches.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    whereConditions.push({
      roles: {some: {name: ROLE_NAME_COACH}},
    });
    if (venueId && typeId) {
      whereConditions.push({
        profile: {eventVenueIds: {has: venueId}, eventTypeIds: {has: typeId}},
      });
    } else if (venueId) {
      whereConditions.push({profile: {eventVenueIds: {has: venueId}}});
    } else if (venueId) {
      whereConditions.push({profile: {eventTypeIds: {has: typeId}}});
    }

    if (whereConditions.length > 1) {
      where = {AND: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get coaches for the specific venue.
    return await this.userService.findMany({
      where: where,
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
  }

  /* End */
}
