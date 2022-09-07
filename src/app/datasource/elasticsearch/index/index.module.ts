import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexController} from './index.controller';
import {ElasticsearchDatasourceIndexService} from './index.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {ElasticsearchModule} from 'src/_elasticsearch/_elasticsearch.module';

@Module({
  imports: [PrismaModule, ElasticsearchModule],
  controllers: [ElasticsearchDatasourceIndexController],
  providers: [ElasticsearchDatasourceIndexService],
  exports: [ElasticsearchDatasourceIndexService],
})
export class ElasticsearchDatasourceIndexModule {}
