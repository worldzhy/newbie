import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceController} from './elasticsearch-datasource.controller';
import {ElasticsearchDatasourceService} from './elasticsearch-datasource.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElasticsearchDatasourceController],
  providers: [ElasticsearchDatasourceService],
  exports: [ElasticsearchDatasourceService],
})
export class ElasticsearchDatasourceModule {}
