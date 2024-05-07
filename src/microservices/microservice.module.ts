import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from './account/account.module';
import {AwsIaaSModule} from './cloud/iaas/aws/module';
import {AwsSaaSModule} from './cloud/saas/aws/module';
import {GoogleSaaSModule} from './cloud/saas/google/module';
import {CronTaskModule} from './cron/cron.module';
import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {MapModule} from './map/map.module';
import {NotificationModule} from './notification/notification.module';
import {OrderManagementModule} from './order-mgmt/order-mgmt.module';
import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';
import {TagModule} from './tag/tag.module';
import {WorkflowModule} from './workflow/workflow.module';
import {PeopleFinderModule} from './people-finder/people-finder.module';
import MicroserviceConfiguration from './microservice.config';

@Global()
@Module({
  imports: [
    ToolkitModule,

    ConfigModule.forRoot({load: [MicroserviceConfiguration], isGlobal: true}),
    AccountModule,
    AwsIaaSModule,
    AwsSaaSModule,
    GoogleSaaSModule,
    CronTaskModule,
    EventSchedulingModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    StockManagementModule,
    TagModule,
    WorkflowModule,
    PeopleFinderModule,
  ],
})
export class MicroserviceModule {}
