import {Module} from '@nestjs/common';
import {PostgresqlDatasourceController} from './postgresql-datasource.controller';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';

@Module({
  controllers: [PostgresqlDatasourceController],
  providers: [PostgresqlDatasourceService],
  exports: [PostgresqlDatasourceService],
})
export class PostgresqlDatasourceModule {}
