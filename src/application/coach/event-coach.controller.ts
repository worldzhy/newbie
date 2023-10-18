import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {datePlusMinutes, getWeekNumber} from '@toolkit/utilities/datetime.util';
import {CoachService} from './coach.service';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('event-coaches')
export class EventCoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('')
  async getCoachesForEvent(
    @Query('venueId') venueId: number,
    @Query('typeId') typeId: number,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('dayOfMonth') dayOfMonth: number,
    @Query('hour') hour: number,
    @Query('minute') minute: number,
    @Query('minutesOfDuration') minutesOfDuration: number
  ) {
    const datetimeOfStart = new Date(year, month - 1, dayOfMonth, hour, minute);
    const datetimeOfEnd = datePlusMinutes(datetimeOfStart, minutesOfDuration);
    const event = {
      venueId,
      typeId,
      datetimeOfStart,
      datetimeOfEnd,
      year,
      month,
      week: getWeekNumber(year, month, dayOfMonth),
      minutesOfDuration,
    };

    return await this.coachService.getSortedCoachesForEvent(event);
  }

  /* End */
}
