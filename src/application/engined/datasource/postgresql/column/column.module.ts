import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnService} from './column.service';
import {PrismaModule} from '../../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
