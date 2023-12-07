import {Module} from '@nestjs/common';
import {ApplicationBaseModule} from '@application-base/application-base.module';

import {AvailabilityModule} from './availability/availability.module';
import {CoachModule} from './coach/coach.module';
import {MindbodyModule} from './mindbody/mindbody.module';
import {RawDataModule} from './raw-data/raw-data.module';
import {SchedulingModule} from './schedule/schedule.module';

import {ApplicationSolidcoreController} from './application-solidcore.controller';
import {AnalysisController} from './analysis/analysis.controller';
import {AreaManagerController} from './area-manager/area-manager.controller';
import {ClassController} from './class/class.controller';
import {HeatmapController} from './heatmap/heatmap.controller';
import {LocationController} from './location/location.controller';
import {TagController} from './tag/tag.controller';

@Module({
  imports: [
    ApplicationBaseModule, // Hope you enjoy the Newbie!
    AvailabilityModule,
    CoachModule,
    MindbodyModule,
    RawDataModule,
    SchedulingModule,
  ],
  controllers: [
    ApplicationSolidcoreController,
    AnalysisController,
    AreaManagerController,
    ClassController,
    HeatmapController,
    LocationController,
    TagController,
  ],
})
export class ApplicationSolidcoreModule {}
