import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {MindbodyService} from '@microservices/mindbody/mindbody.service';
import {
  AddClassScheduleDto,
  BasePageDto,
  endClassScheduleDto,
} from '@microservices/mindbody/mindbody.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
import {groupClassesByDate} from '@microservices/mindbody/util';

@ApiTags('Mindbody')
@Controller('mindbody')
export class MindbodyController {
  constructor(private readonly mindbodyService: MindbodyService) {}

  @Post('usertoken/issue')
  async getUserToken() {
    return await this.mindbodyService.getUserToken();
  }

  @Get('site/locations')
  async getLocations(@Query() query: BasePageDto) {
    return await this.mindbodyService.getLocations(query);
  }

  @Get('site/resources')
  async getResources(@Query() query: BasePageDto) {
    return await this.mindbodyService.getResources(query);
  }

  @Get('class/classdescriptions')
  async getClassDescriptions(@Query() query: BasePageDto) {
    return await this.mindbodyService.getClassDescriptions(query);
  }

  @Get('class/classes')
  async getClass(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClasses(query);
    const {Classes: cs} = resp.data;

    const groupCs = groupClassesByDate(cs);

    return {
      groupCs,
      resp,
    };
  }

  @Get('class/classes2')
  async getClass2(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClasses(query);
    return resp;
  }

  @Get('class/classvisits')
  async getClassVisits(@Query() query: BasePageDto) {
    return await this.mindbodyService.getClassVisits(query);
  }

  @Get('class/classschedulebyId')
  async getClassSchduleById(@Query('schduleId') schduleId: number) {
    const resp = await this.mindbodyService.getClassSchduleById(schduleId);
    return resp;
  }

  @Get('class/classschedules')
  async getClassSchedules(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClassSchedules(query);

    // const {ClassSchedules: cs} = resp;

    // const _cs = cs.map((c: any) => {
    //   if (c.DaySunday) {
    //     c.weekday = 0;
    //   }
    //   if (c.DayMonday) {
    //     c.weekday = 1;
    //   }
    //   if (c.DayTuesday) {
    //     c.weekday = 2;
    //   }
    //   if (c.DayWednesday) {
    //     c.weekday = 3;
    //   }
    //   if (c.DayThursday) {
    //     c.weekday = 4;
    //   }
    //   if (c.DayFriday) {
    //     c.weekday = 5;
    //   }
    //   if (c.DaySaturday) {
    //     c.weekday = 6;
    //   }

    //   return {
    //     name: c.ClassDescription.Name,
    //     weekday: c.weekday,
    //     startHour: moment(c.StartTime).hour(),
    //     startTime: moment(c.StartTime).format('HH:mm:ss'),
    //     endTime: moment(c.EndTime).format('HH:mm:ss'),
    //   };
    // });

    // const groupCs = _.groupBy(_cs, (d: any) => {
    //   return d.weekday;
    // });

    // for (const dc of Object.keys(groupCs)) {
    //   groupCs[dc] = _.sortBy(groupCs[dc], (d: any) => d.startHour);
    // }

    return resp;
  }

  @Post('class/addclassschedule')
  async addClassSchedule(@Body() body: AddClassScheduleDto) {
    return await this.mindbodyService.addClassSchedule(body);
  }

  @Post('class/updateclassschedule')
  async updateClassSchedule(@Body() body: AddClassScheduleDto) {
    return await this.mindbodyService.updateClassSchedule(body);
  }

  @Post('class/endclassschedulebyId')
  async endClassSchduleById(@Body() body: endClassScheduleDto) {
    const resp = await this.mindbodyService.endClassSchduleById(body);
    return resp;
  }

  @Get('staff/staff')
  async getStaff(@Query() query: BasePageDto) {
    return await this.mindbodyService.getStaff(query);
  }
}
