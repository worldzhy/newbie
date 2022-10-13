import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableController} from './table.controller';
import {PostgresqlDatasourceTableService} from './table.service';

@Module({
  controllers: [PostgresqlDatasourceTableController],
  providers: [PostgresqlDatasourceTableService],
  exports: [PostgresqlDatasourceTableService],
})
export class PostgresqlDatasourceTableModule {}
