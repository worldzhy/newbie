import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';

@Module({
  providers: [ElasticsearchDatasourceIndexFieldService],
  exports: [ElasticsearchDatasourceIndexFieldService],
})
export class ElasticsearchDatasourceIndexFieldModule {}
