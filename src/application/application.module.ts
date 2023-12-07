import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';

import {AllExceptionFilter} from '@_filter/_all-exception.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {GoogleAPIsModule} from '@microservices/googleapis/googleapis.module';
import {MapModule} from '@microservices/map/map.module';
import {MindbodyModule} from 'src/application/mindbody/mindbody.module';
import {QueueModule} from '@microservices/queue/queue.module';
import {TagModule} from '@microservices/tag/tag.module';
import {AvailabilityModule} from './availability/availability.module';
import {CoachModule} from './coach/coach.module';
import {RawDataModule} from './raw-data/raw-data.module';
import {ApplicationController} from './application.controller';
import {AccountForgotController} from './account/account-password.controller';
import {AccountLoginController} from './account/account-login.controller';
import {AccountLogoutController} from './account/account-logout.controller';
import {AccountSignupController} from './account/account-signup.controller';
import {AccountOthersController} from './account/account-others.controller';
import {AreaManagerController} from './area-manager/area-manager.controller';
import {ClassController} from './class/class.controller';
import {EventController} from './schedule/schedule-class.controller';
import {EventContainerController} from './schedule/schedule.controller';
import {EventChangeLogController} from './schedule/schedule-class-changelog.controller';
import {EventCopyController} from './schedule/schedule-import.controller';
import {EventFixController} from './schedule/schedule-fix.controller';
import {HeatmapController} from './heatmap/heatmap.controller';
import {LocationController} from './location/location.controller';
import {MindbodyController} from './mindbody/mindbody.controller';
import {TagController} from './tag/tag.controller';
import {TagGroupController} from './tag/tag-group.controller';
import {RawDataController} from './raw-data/raw-data.controller';
import {AnalysisController} from './analysis/analysis.controller';

@Module({
  imports: [
    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    AccountModule,
    EventSchedulingModule,
    GoogleAPIsModule,
    MapModule,
    MindbodyModule,
    QueueModule,
    TagModule,

    // Application
    AvailabilityModule,
    CoachModule,
    EventSchedulingModule,
    RawDataModule,
  ],
  controllers: [
    ApplicationController,
    AccountForgotController,
    AccountLoginController,
    AccountLogoutController,
    AccountSignupController,
    AccountOthersController,
    AreaManagerController,
    ClassController,
    HeatmapController,
    LocationController,
    MindbodyController,
    TagController,
    TagGroupController,
    RawDataController,
    AnalysisController,
  ],
  providers: [
    // Filters
    {provide: APP_FILTER, useClass: AllExceptionFilter}, // 4th priority for all exceptions.
    {provide: APP_FILTER, useClass: PrismaExceptionFilter}, // 3rd priority for exceptions thrown by services.
    {provide: APP_FILTER, useClass: HttpExceptionFilter}, // 2nd priority for exceptions thrown by controllers.
    {provide: APP_FILTER, useClass: ThrottlerExceptionFilter}, // 1st priority for exceptions thrown by throttler (rate limit).
  ],
})
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
