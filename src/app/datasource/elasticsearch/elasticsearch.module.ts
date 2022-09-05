import {Module} from '@nestjs/common';
import {DatasourceElasticsearchController} from './elasticsearch.controller';
import {DatasourceElasticsearchService} from './elasticsearch.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatasourceElasticsearchController],
  providers: [DatasourceElasticsearchService],
  exports: [DatasourceElasticsearchService],
})
export class DatasourceElasticsearchModule {}
