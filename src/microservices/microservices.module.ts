import {Global, Module} from '@nestjs/common';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {AccountModule} from './account/account.module';
import {ElasticsearchModule} from './elasticsearch/elasticsearch.module';
import {MessageBotModule} from './message-bot/message-bot.module';
import {NotificationModule} from './notification/notification.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    AccountModule,
    ElasticsearchModule,
    MessageBotModule,
    NotificationModule,
  ],
})
export class MicroservicesModule {}
