import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnController} from './column.controller';
import {PostgresqlDatasourceTableColumnService} from './column.service';

@Module({
  controllers: [PostgresqlDatasourceTableColumnController],
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
