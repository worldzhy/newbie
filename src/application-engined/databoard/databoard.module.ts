import {Module} from '@nestjs/common';
import {ElasticsearchDataboardController} from './elasticsearch/elasticsearch-databoard.controller';
import {ElasticsearchDataboardColumnController} from './elasticsearch/column/column.controller';

@Module({
  controllers: [
    ElasticsearchDataboardController,
    ElasticsearchDataboardColumnController,
  ],
})
export class DataboardModule {}
