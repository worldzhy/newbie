import {Module} from '@nestjs/common';
import {ElasticsearchDataboardController} from './elasticsearch-databoard.controller';
import {ElasticsearchDataboardService} from './elasticsearch-databoard.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElasticsearchDataboardController],
  providers: [ElasticsearchDataboardService],
  exports: [ElasticsearchDataboardService],
})
export class ElasticsearchDataboardModule {}
