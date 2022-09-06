import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnController} from './table-column.controller';
import {PostgresqlDatasourceTableColumnService} from './table-column.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceTableColumnController],
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
