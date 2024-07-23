import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroserviceConfiguration from './microservice.config';
import {ConfigModule} from '@nestjs/config';
import {AccountModule} from './account/account.module';
import {AwsModule} from './aws/aws.module';
import {AwsCloudformationModule} from './cloudformation/cloudformation.module';
import {CronTaskModule} from './cron/cron.module';
import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {GoogleAPIsModule} from './googleapis/googleapis.module';
import {MapModule} from './map/map.module';
import {NotificationModule} from './notification/notification.module';
import {OrderManagementModule} from './order-mgmt/order-mgmt.module';
import {PeopleFinderModule} from './people-finder/people-finder.module';
import {QueueModule} from './queue/queue.module';
import {ShortcutModule} from './shortcut/shortcut.module';
import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';
import {StorageModule} from './storage/storage.module';
import {TagModule} from './tag/tag.module';
import {WorkflowModule} from './workflow/workflow.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroserviceConfiguration], isGlobal: true}),
    AccountModule,
    AwsModule,
    AwsCloudformationModule,
    CronTaskModule,
    EventSchedulingModule,
    GoogleAPIsModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    PeopleFinderModule,
    QueueModule,
    ShortcutModule,
    StockManagementModule,
    StorageModule,
    TagModule,
    WorkflowModule,
  ],
})
export class MicroserviceModule {}
