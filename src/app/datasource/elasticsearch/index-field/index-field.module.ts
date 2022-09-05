import {Module} from '@nestjs/common';
import {DatasourceElasticsearchIndexFieldController} from './index-field.controller';
import {DatasourceElasticsearchIndexFieldService} from './index-field.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {ElasticsearchModule} from 'src/_elasticsearch/_elasticsearch.module';

@Module({
  imports: [PrismaModule, ElasticsearchModule],
  controllers: [DatasourceElasticsearchIndexFieldController],
  providers: [DatasourceElasticsearchIndexFieldService],
  exports: [DatasourceElasticsearchIndexFieldService],
})
export class DatasourceElasticsearchIndexFieldModule {}
