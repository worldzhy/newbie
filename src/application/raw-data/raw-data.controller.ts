import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {RawDataCoachService} from './raw-data-coach.service';
import {RawDataLocationService} from './raw-data-location.service';
import {RawDataSchedulingService} from './raw-data-scheduling.service';

@ApiTags('Raw Data')
@ApiBearerAuth()
@Controller('raw-data')
export class RawDataController {
  constructor(
    private readonly rawDataCoachService: RawDataCoachService,
    private readonly rawDataLocationService: RawDataLocationService,
    private readonly rawDataSchedulingService: RawDataSchedulingService
  ) {}

  @Get('sync-coaches')
  async syncCoaches() {
    await this.rawDataCoachService.syncCoachesAndLinkLocations();
  }

  @Get('sync-locations')
  async syncLocations() {
    await this.rawDataLocationService.syncLocations();
  }

  @Get('sync-visit-data')
  @ApiQuery({name: 'venueId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  async syncScheduling(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    await this.rawDataSchedulingService.synchronize({venueId, year, month});
  }

  /* End */
}
