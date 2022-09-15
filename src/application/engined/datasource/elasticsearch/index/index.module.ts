import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexController} from './index.controller';
import {ElasticsearchDatasourceIndexService} from './index.service';
import {ElasticModule} from '../../../../../toolkits/elastic/elastic.module';
import {PrismaModule} from '../../../../../toolkits/prisma/prisma.module';

@Module({
  imports: [ElasticModule, PrismaModule],
  controllers: [ElasticsearchDatasourceIndexController],
  providers: [ElasticsearchDatasourceIndexService],
  exports: [ElasticsearchDatasourceIndexService],
})
export class ElasticsearchDatasourceIndexModule {}
