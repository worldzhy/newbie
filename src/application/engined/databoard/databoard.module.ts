import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {ElasticsearchDataboardModule} from './elasticsearch/elasticsearch-databoard.module';

@Module({
  imports: [PrismaModule, ElasticsearchDataboardModule],
})
export class DataboardModule {}
