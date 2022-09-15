import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceController} from './elasticsearch-datasource.controller';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {PrismaModule} from '../../../../toolkits/prisma/prisma.module';
import {ElasticsearchDatasourceIndexModule} from './index/index.module';

@Module({
  imports: [PrismaModule, ElasticsearchDatasourceIndexModule],
  controllers: [ElasticsearchDatasourceController],
  providers: [ElasticsearchDatasourceService],
  exports: [ElasticsearchDatasourceService],
})
export class ElasticsearchDatasourceModule {}
