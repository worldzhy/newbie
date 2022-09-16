import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnService} from './column.service';

@Module({
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
