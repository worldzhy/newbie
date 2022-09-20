import {Module} from '@nestjs/common';
import {ElasticsearchDataboardColumnModule} from './elasticsearch/column/column.module';
import {ElasticsearchDataboardModule} from './elasticsearch/elasticsearch-databoard.module';

@Module({
  imports: [ElasticsearchDataboardModule, ElasticsearchDataboardColumnModule],
})
export class DataboardModule {}
