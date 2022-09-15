import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';
import {PrismaModule} from '../../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ElasticsearchDatasourceIndexFieldService],
  exports: [ElasticsearchDatasourceIndexFieldService],
})
export class ElasticsearchDatasourceIndexFieldModule {}
