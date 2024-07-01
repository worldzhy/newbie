import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {AvailabilityModule} from './availability/availability.module';
import {ClassModule} from './class/class.module';
import {CoachModule} from './coach/coach.module';
import {MindbodyModule} from './mindbody/mindbody.module';
import {RawDataModule} from './raw-data/raw-data.module';
import {SchedulingModule} from './schedule/schedule.module';

import {ApplicationSolidcoreController} from './application-solidcore.controller';
import {AnalysisController} from './analysis/analysis.controller';
import {AreaManagerController} from './area-manager/area-manager.controller';
import {HeatmapController} from './heatmap/heatmap.controller';
import {LocationController} from './location/location.controller';

@Module({
  imports: [
    FrameworkModule,
    MicroserviceModule,

    AvailabilityModule,
    ClassModule,
    CoachModule,
    MindbodyModule,
    RawDataModule,
    SchedulingModule,
  ],
  controllers: [
    ApplicationSolidcoreController,
    AnalysisController,
    AreaManagerController,
    HeatmapController,
    LocationController,
  ],
})
export class ApplicationSolidcoreModule {}
