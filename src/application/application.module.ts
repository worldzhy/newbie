import {APP_FILTER} from '@nestjs/core';
import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import ApplicationConfiguration from '@_config/application.config';
import MicroservicesConfiguration from '@_config/microservice.config';
import ToolkitConfiguration from '@_config/toolkit.config';
import {AllExceptionFilter} from '@_filter/_all-exception.filter';
import {HttpExceptionFilter} from '@_filter/_http-exception.filter';
import {PrismaExceptionFilter} from '@_filter/_prisma-exception.filter';
import {ThrottlerExceptionFilter} from '@_filter/_throttler-exception.filter';
import {HttpMiddleware} from '@_middleware/_http.middleware';

import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {MapModule} from '@microservices/map/map.module';
import {TagModule} from '@microservices/tag/tag.module';
import {CoachModule} from './coach/coach.module';
import {RawDataModule} from './raw-data/raw-data.module';
import {ApplicationController} from './application.controller';
import {AccountForgotController} from './account/account-password.controller';
import {AccountLoginController} from './account/account-login.controller';
import {AccountLogoutController} from './account/account-logout.controller';
import {AccountSignupController} from './account/account-signup.controller';
import {AccountOthersController} from './account/account-others.controller';
import {AreaManagerController} from './area-manager/area-manager.controller';
import {AvailabilityExpressionController} from './coach/availability/availability-expression.controller';
import {ClassController} from './class/class.controller';
import {EventCoachController} from './coach/event-coach.controller';
import {EventController} from './scheduling/event.controller';
import {EventContainerController} from './scheduling/event-container.controller';
import {EventContainerNoteController} from './scheduling/event-container-note.controller';
import {EventCopyController} from './scheduling/event-copy.controller';
import {EventCheckController} from './scheduling/event-check.controller';
import {EventFixController} from './scheduling/event-fix.controller';
import {HeatmapController} from './heatmap/heatmap.controller';
import {LocationController} from './location/location.controller';
import {TagController} from './tag/tag.controller';
import {TagGroupController} from './tag/tag-group.controller';
import {RawDataController} from './raw-data/raw-data.controller';
import {AnalysisController} from './analysis/analysis.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        ApplicationConfiguration,
        MicroservicesConfiguration,
        ToolkitConfiguration,
      ],
      isGlobal: true,
    }),

    // Toolkit (Global modules)
    ToolkitModule,

    // Microservices (Global modules)
    AccountModule,
    EventSchedulingModule,
    MapModule,
    TagModule,

    // Application
    CoachModule,
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
    AvailabilityExpressionController,
    ClassController,
    EventCoachController,
    EventController,
    EventContainerController,
    EventContainerNoteController,
    EventCopyController,
    EventCheckController,
    EventCoachController,
    EventFixController,
    HeatmapController,
    LocationController,
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
