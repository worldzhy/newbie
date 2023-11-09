import {Module} from '@nestjs/common';
import {CoachController} from './coach.controller';
import {CoachService} from './coach.service';
import {FetchGoogleFormService} from '../availability/fetch-google-form.service';

@Module({
  controllers: [CoachController],
  providers: [CoachService, FetchGoogleFormService],
  exports: [CoachService, FetchGoogleFormService],
})
export class CoachModule {}
