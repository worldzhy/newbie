import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {MindbodyService} from './mindbody.service';
import {
  AddClassScheduleDto,
  BasePageDto,
  endClassScheduleDto,
} from './mindbody.dto';
import {groupClassesByDate} from './util';
import * as _ from 'lodash';
import {MindbodyLocationService} from './mindbody-location.service';

@ApiTags('Mindbody')
@ApiBearerAuth()
@Controller('mindbody')
export class MindbodyController {
  constructor(
    private readonly mindbodyService: MindbodyService,
    private readonly mindbodyLocationService: MindbodyLocationService
  ) {}

  // @Post('usertoken/issue')
  // async getUserToken() {
  //   return await this.mindbodyService.getUserToken();
  // }

  @Get('site/locations')
  async getLocations(@Query() query: BasePageDto) {
    return await this.mindbodyService.getLocations(query);
  }

  @Get('site/resourceavailabilities')
  async getResourcesAvailabilities(@Query() query: BasePageDto) {
    return await this.mindbodyService.getResourcesAvailabilities(query);
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
    const resp = await this.mindbodyService.getClassDescriptions(query);
    // const psrsedResp = parseDess(resp);

    return resp;
  }

  @Get('class/classes')
  async getClass(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getClasses(query);
    const {Classes: cs} = resp.data;

    const groupCs = groupClassesByDate(cs);

    return {
      total: _.get(resp, 'data.PaginationResponse.TotalResults'),
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

  @Get('class/stopClassSchedulesByClass')
  async stopClassSchedulesByClass(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.stopClassSchedulesByClass(query);
    return resp;
  }

  @Get('pricingoption/pricingoptions')
  async getPricingoptions(@Query() query: BasePageDto) {
    const resp = await this.mindbodyService.getPricingoptions(query);
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

  @Post('class/cancelClass')
  async cancelClass(@Body() body: any) {
    return await this.mindbodyService.cancelClass(body);
  }

  @Post('class/updateclassschedule')
  async updateClassSchedule(@Body() body: AddClassScheduleDto) {
    return await this.mindbodyService.updateClassSchedule(body);
  }

  // @Post('class/endclassschedulebyId')
  // async endClassSchduleById(@Body() body: endClassScheduleDto) {
  //   const resp = await this.mindbodyService.endClassSchduleById(body);
  //   return resp;
  // }

  @Post('class/endClassFeatureSchduleById')
  async endClassFeatureSchduleById(@Body() body: endClassScheduleDto) {
    const resp = await this.mindbodyService.endClassFeatureSchduleById(body);
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

  @Get('site/programs')
  async getPrograms(@Query() query: BasePageDto) {
    return await this.mindbodyService.getPrograms(query);
  }

  @Get('site/paymenttypes')
  async getPaymenttypes(@Query() query: BasePageDto) {
    return await this.mindbodyService.getPaymenttypes(query);
  }

  @Get('locations')
  async getAllLocations() {
    return await this.mindbodyLocationService.getLocations();
  }
}
