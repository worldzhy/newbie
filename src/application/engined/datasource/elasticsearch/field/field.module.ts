import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceIndexFieldService} from './field.service';
import {PrismaModule} from '../../../../../tools/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ElasticsearchDatasourceIndexFieldService],
  exports: [ElasticsearchDatasourceIndexFieldService],
})
export class ElasticsearchDatasourceIndexFieldModule {}
