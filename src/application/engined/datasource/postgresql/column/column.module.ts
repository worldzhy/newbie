import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnService} from './column.service';
import {PrismaModule} from '../../../../../toolkits/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
