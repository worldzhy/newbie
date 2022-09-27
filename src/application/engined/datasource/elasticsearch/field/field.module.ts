import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexFieldController} from './field.controller';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';

@Module({
  controllers: [ElasticsearchDatasourceIndexFieldController],
  providers: [ElasticsearchDatasourceIndexFieldService],
  exports: [ElasticsearchDatasourceIndexFieldService],
})
export class ElasticsearchDatasourceIndexFieldModule {}
