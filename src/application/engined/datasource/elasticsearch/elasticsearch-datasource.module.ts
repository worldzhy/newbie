import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceController} from './elasticsearch-datasource.controller';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexModule} from './index/index.module';

@Module({
  imports: [ElasticsearchDatasourceIndexModule],
  controllers: [ElasticsearchDatasourceController],
  providers: [ElasticsearchDatasourceService],
  exports: [ElasticsearchDatasourceService],
})
export class ElasticsearchDatasourceModule {}
