import {DataGenerationService} from 'src/application-solidcore/schedule/machine-learning/data-generation.service';
import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('schedule-prediction')
export class SchedulePredictionController {
  constructor(private dataGenerationService: DataGenerationService) {}

  @Post('genClassTrainingSet')
  async genClassTrainingSet(@Body() body: any) {
    return this.dataGenerationService.genClassTrainingSet(body);
  }
}
