import {Module} from '@nestjs/common';
import {PostgresqlDatasourceConstraintService} from './constraint.service';

@Module({
  providers: [PostgresqlDatasourceConstraintService],
  exports: [PostgresqlDatasourceConstraintService],
})
export class PostgresqlDatasourceConstraintModule {}
