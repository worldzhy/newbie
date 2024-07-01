import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {AppCronModule} from '../application-goclick/cron/cron.module';
import {AppEventSchedulingModule} from '../application-goclick/event-scheduling/event-scheduling.module';
import {AppNotificationModule} from '../application-goclick/notification/notification.module';
import {AppPeopleFinderModule} from '../application-goclick/people-finder/people-finder.module';
import {AppShortcutModule} from './shortcut/shortcut.module';
import {AppSolutionModule} from './solution/solution.module';
import {AppStorageModule} from '../application-goclick/storage/storage.module';
import {AppWorkflowModule} from '../application-goclick/workflow/workflow.module';

import {ApplicationGoClickController} from './application-goclick.controller';

@Module({
  imports: [
    FrameworkModule,
    MicroserviceModule,

    AppCronModule,
    AppEventSchedulingModule,
    AppNotificationModule,
    AppPeopleFinderModule,
    AppShortcutModule,
    AppSolutionModule,
    AppStorageModule,
    AppWorkflowModule,
  ],
  controllers: [ApplicationGoClickController],
})
export class ApplicationGoClickModule {}
