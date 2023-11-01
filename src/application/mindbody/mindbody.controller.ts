import {Controller, Get, Post, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {MindbodyService} from '@microservices/mindbody/mindbody.service';

@ApiTags('Mindbody')
@ApiBearerAuth()
@Controller('mindbody')
export class MindbodyController {
  constructor(private readonly mindbodyService: MindbodyService) {}

  @Get('class-decriptions')
  async getClassDescriptions(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    await this.mindbodyService.login();
    return await this.mindbodyService.getClassDescriptions();
  }

  @Get('locations')
  async getEventContainer(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    await this.mindbodyService.login();
    return await this.mindbodyService.getLocations();
  }

  @Post('class-schedule')
  async addClassSchedule() {
    await this.mindbodyService.login();
    return await this.mindbodyService.addClassSchedule();
  }

  /* End */
}
