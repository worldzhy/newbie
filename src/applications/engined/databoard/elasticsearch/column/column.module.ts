import {Module} from '@nestjs/common';
import {ElasticsearchDataboardColumnController} from './column.controller';
import {ElasticsearchDataboardColumnService} from './column.service';

@Module({
  controllers: [ElasticsearchDataboardColumnController],
  providers: [ElasticsearchDataboardColumnService],
  exports: [ElasticsearchDataboardColumnService],
})
export class ElasticsearchDataboardColumnModule {}
