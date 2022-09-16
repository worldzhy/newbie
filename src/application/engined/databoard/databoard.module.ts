import {Module} from '@nestjs/common';
import {ElasticsearchDataboardModule} from './elasticsearch/elasticsearch-databoard.module';

@Module({
  imports: [ElasticsearchDataboardModule],
})
export class DataboardModule {}
