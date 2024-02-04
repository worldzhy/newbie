import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ToolkitModule} from '@toolkit/toolkit.module';
import {AccountModule} from './account/account.module';
import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';
import {GoogleAPIsModule} from './googleapis/googleapis.module';
import {FileManagementModule} from './file-mgmt/file-mgmt.module';
import {MapModule} from './map/map.module';
import {NotificationModule} from './notification/notification.module';
import {OrderManagementModule} from './order-mgmt/order-mgmt.module';
import {ProjectManagementModule} from './project-mgmt/project-mgmt.module';
import {QueueModule} from './queue/queue.module';
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
    EventSchedulingModule,
    GoogleAPIsModule,
    FileManagementModule,
    MapModule,
    NotificationModule,
    OrderManagementModule,
    ProjectManagementModule,
    QueueModule,
    StockManagementModule,
    TagModule,
    TokenModule,
    WorkflowModule,
  ],
})
export class MicroserviceModule {}
