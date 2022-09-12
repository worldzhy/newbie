import {Module} from '@nestjs/common';
import {DatatransPipelineController} from './pipeline.controller';
import {DatatransPipelineService} from './pipeline.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {DatasourceModule} from '../../datasource/datasource.module';

@Module({
  imports: [PrismaModule, DatasourceModule],
  controllers: [DatatransPipelineController],
  providers: [DatatransPipelineService],
  exports: [DatatransPipelineService],
})
export class DatatransPipelineModule {}
