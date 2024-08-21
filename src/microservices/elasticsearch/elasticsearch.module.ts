import {Module, Global} from '@nestjs/common';
import {ElasticsearchService} from './elasticsearch.service';

@Global()
@Module({
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
