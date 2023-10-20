import {Controller, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {UserService} from '@microservices/account/user/user.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';

@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly eventContainerService: EventContainerService,
    private readonly coachService: UserService
  ) {}

  @Get('coaches-under-quota')
  async getCoachesUnderQuota(@Query('containerId') containerId: number) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  @Get('coaches-under-preferred-class-count')
  async getCoachesUnderPreferred(@Query('containerId') containerId: number) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  @Get('coaches-over-preferred-class-count')
  async getCoachesOverPreferredClassCount(
    @Query('containerId') containerId: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  @Get('coach-with-highest-class-count')
  async getCoachWithHighestClassCount(
    @Query('containerId') containerId: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  @Get('coach-with-lowest-class-count')
  async getCoachWithLowestClassCount(
    @Query('containerId') containerId: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  @Get('count-of-class-changes')
  async getCountOfClassChanges(@Query('containerId') containerId: number) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
  }

  /* End */
}
