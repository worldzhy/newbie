import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {HeatmapService} from '@microservices/event-scheduling/heatmap.service';

@ApiTags('Event Calendar')
@ApiBearerAuth()
@Controller('heatmap')
export class EventCalendarController {
  constructor(private readonly heatmapService: HeatmapService) {}

  @Get('coach-availability')
  async getCoachAvailabilityHeatmap(query: {
    year: number;
    month: number;
    location: string;
  }) {
    return await this.heatmapService.getCoachAvailabilityHeatmap(query);
  }

  /* End */
}
