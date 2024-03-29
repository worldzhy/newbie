import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from './account/account.module';
import {CronTaskModule} from './cron/cron.module';
import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {FileManagementModule} from './file-mgmt/file-mgmt.module';
import {GoogleAPIsModule} from './googleapis/googleapis.module';
import {JobQueueModule} from './job-queue/job-queue.module';
import {MapModule} from './map/map.module';
import {NotificationModule} from './notification/notification.module';
import {OrderManagementModule} from './order-mgmt/order-mgmt.module';
import {ProjectManagementModule} from './project-mgmt/project-mgmt.module';
import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';
import {TagModule} from './tag/tag.module';
import {TokenModule} from './token/token.module';
import {WorkflowModule} from './workflow/workflow.module';
import MicroserviceConfiguration from './microservice.config';

@Global()
@Module({
  imports: [
    ToolkitModule,

    ConfigModule.forRoot({load: [MicroserviceConfiguration], isGlobal: true}),
    AccountModule,
    CronTaskModule,
    EventSchedulingModule,
    FileManagementModule,
    GoogleAPIsModule,
    JobQueueModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    ProjectManagementModule,
    StockManagementModule,
    TagModule,
    TokenModule,
    WorkflowModule,
  ],
})
export class MicroserviceModule {}
