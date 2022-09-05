import {Module} from '@nestjs/common';
import {DatasourcePostgresqlTableColumnController} from './table-column.controller';
import {DatasourcePostgresqlTableColumnService} from './table-column.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatasourcePostgresqlTableColumnController],
  providers: [DatasourcePostgresqlTableColumnService],
  exports: [DatasourcePostgresqlTableColumnService],
})
export class DatasourcePostgresqlTableColumnModule {}
