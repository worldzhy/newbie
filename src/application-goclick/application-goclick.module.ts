import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';
import {AppCronModule} from '../application-goclick/cron/cron.module';
import {AppEventSchedulingModule} from '../application-goclick/event-scheduling/event-scheduling.module';
import {AppNotificationModule} from '../application-goclick/notification/notification.module';
import {AppStorageModule} from '../application-goclick/storage/storage.module';
import {AppWorkflowModule} from '../application-goclick/workflow/workflow.module';
import {AppPeopleFinderModule} from '../application-goclick/people-finder/people-finder.module';

import {ApplicationGoClickController} from './application-goclick.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!

    AppCronModule,
    AppEventSchedulingModule,
    AppNotificationModule,
    AppStorageModule,
    AppWorkflowModule,
    AppPeopleFinderModule,
  ],
  controllers: [ApplicationGoClickController],
})
export class ApplicationGoClickModule {}
