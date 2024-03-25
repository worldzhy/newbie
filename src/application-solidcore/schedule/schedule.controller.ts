import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import _ from 'lodash';
import {ScheduleService} from './schedule.service';

@ApiTags('Solidcore / Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('days-of-month')
  getDaysOfMonth(@Query('year') year: number, @Query('month') month: number) {
    return daysOfMonth(year, month);
  }

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    return await this.scheduleService.checkContainer({
      eventContainerId,
      weekOfMonth,
    });
  }

  /* End */
}
