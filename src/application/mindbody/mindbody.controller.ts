import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {MindbodyService} from 'src/application/mindbody/mindbody.service';
import {
  AddClassScheduleDto,
  BasePageDto,
  endClassScheduleDto,
} from 'src/application/mindbody/mindbody.dto';
import {groupClassesByDate} from 'src/application/mindbody/util';

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

  @Get('sale/products')
  async getProducts(@Query() query: BasePageDto) {
    return await this.mindbodyService.getProducts(query);
  }

  @Get('class/classdescriptions')
  async getClassDescriptions(@Query() query: BasePageDto) {
    return await this.mindbodyService.getClassDescriptions(query);
  }

  @Get('class/classes')
  async getClass(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClasses(query);
    const {Classes: cs} = resp.data;

    const {resourceId} = query;

    const groupCs = groupClassesByDate(cs, resourceId);

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

  @Get('class/stopclassschedules')
  async stopClassSchedules(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.stopClassSchedules(query);
    return resp;
  }

  @Get('class/classschedules')
  async getClassSchedules(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClassSchedules(query);
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

  @Post('class/endClassFeatureSchduleById')
  async endClassSchduleById2(@Body() body: endClassScheduleDto) {
    const resp = await this.mindbodyService.endClassFeatureSchduleById(body);
    return resp;
  }

  @Get('staff/staff')
  async getStaff(@Query() query: BasePageDto) {
    return await this.mindbodyService.getStaff(query);
  }

  @Get('client/clients')
  async queryClinets(@Query() query: BasePageDto) {
    return await this.mindbodyService.queryClinets(query);
  }
}
