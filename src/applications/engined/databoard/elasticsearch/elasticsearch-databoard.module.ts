import {Module} from '@nestjs/common';
import {ElasticsearchDataboardController} from './elasticsearch-databoard.controller';
import {ElasticsearchDataboardService} from './elasticsearch-databoard.service';

@Module({
  controllers: [ElasticsearchDataboardController],
  providers: [ElasticsearchDataboardService],
  exports: [ElasticsearchDataboardService],
})
export class ElasticsearchDataboardModule {}
