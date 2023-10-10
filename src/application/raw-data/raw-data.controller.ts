import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {RawDataService} from './raw-data.service';

@ApiTags('Raw Data')
@ApiBearerAuth()
@Controller('raw-data')
export class RawDataController {
  constructor(private readonly rawDataService: RawDataService) {}

  @Get('sync-coaches')
  async getCoaches() {
    await this.rawDataService.syncCoaches();
  }

  @Get('sync-locations')
  async syncLocations() {
    await this.rawDataService.syncLocations();
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
    await this.rawDataService.syncScheduling({venueId, year, month});
  }

  /* End */
}
