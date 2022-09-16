import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexController} from './index.controller';
import {ElasticsearchDatasourceIndexService} from './index.service';

@Module({
  controllers: [ElasticsearchDatasourceIndexController],
  providers: [ElasticsearchDatasourceIndexService],
  exports: [ElasticsearchDatasourceIndexService],
})
export class ElasticsearchDatasourceIndexModule {}
