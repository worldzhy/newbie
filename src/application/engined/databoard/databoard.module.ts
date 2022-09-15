import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../toolkits/prisma/prisma.module';
import {ElasticsearchDataboardModule} from './elasticsearch/elasticsearch-databoard.module';

@Module({
  imports: [PrismaModule, ElasticsearchDataboardModule],
})
export class DataboardModule {}
