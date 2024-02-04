import {Global, Module} from '@nestjs/common';
import {AccountModule} from '@microservices/account/account.module';
import {EventSchedulingModule} from '@microservices/event-scheduling/event-scheduling.module';
import {GoogleAPIsModule} from '@microservices/googleapis/googleapis.module';
import {FileManagementModule} from '@microservices/file-mgmt/file-mgmt.module';
import {MapModule} from '@microservices/map/map.module';
import {NotificationModule} from '@microservices/notification/notification.module';
import {OrderManagementModule} from '@microservices/order-mgmt/order-mgmt.module';
import {ProjectManagementModule} from '@microservices/project-mgmt/project-mgmt.module';
import {QueueModule} from '@microservices/queue/queue.module';
import {StockManagementModule} from '@microservices/stock-mgmt/stock-mgmt.module';
import {TagModule} from '@microservices/tag/tag.module';
import {TokenModule} from '@microservices/token/token.module';
import {WorkflowModule} from '@microservices/workflow/workflow.module';
import {ConfigModule} from '@nestjs/config';
import MicroserviceConfiguration from '@microservices/microservice.config';

@Global()
@Module({
  imports: [
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
