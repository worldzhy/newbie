import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableColumnController} from './column.controller';
import {PostgresqlDatasourceTableColumnService} from './column.service';
import {PrismaModule} from '../../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceTableColumnController],
  providers: [PostgresqlDatasourceTableColumnService],
  exports: [PostgresqlDatasourceTableColumnService],
})
export class PostgresqlDatasourceTableColumnModule {}
