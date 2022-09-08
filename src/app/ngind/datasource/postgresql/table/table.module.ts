import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableController} from './table.controller';
import {PostgresqlDatasourceTableService} from './table.service';
import {PrismaModule} from '../../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceTableController],
  providers: [PostgresqlDatasourceTableService],
  exports: [PostgresqlDatasourceTableService],
})
export class PostgresqlDatasourceTableModule {}