import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {CronTaskModule} from './cron/cron.module';
import {NotificationModule} from './notification/notification.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    CronTaskModule,
    NotificationModule,
  ],
})
export class MicroservicesModule {}
