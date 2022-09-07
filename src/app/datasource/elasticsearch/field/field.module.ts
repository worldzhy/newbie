import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexFieldController} from './field.controller';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {ElasticsearchModule} from 'src/_elasticsearch/_elasticsearch.module';

@Module({
  imports: [PrismaModule, ElasticsearchModule],
  controllers: [ElasticsearchDatasourceIndexFieldController],
  providers: [ElasticsearchDatasourceIndexFieldService],
  exports: [ElasticsearchDatasourceIndexFieldService],
})
export class ElasticsearchDatasourceIndexFieldModule {}
