import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {DomainsModule} from '../../modules/domains/domains.module';
import {ElasticsearchModule} from '../elasticsearch/elasticsearch.module';
import {TasksService} from './tasks.service';
import {UsersModule} from '../../modules/users/users.module';
import {MetricsModule} from '../../modules/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule,
    DomainsModule,
    UsersModule,
    MetricsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
