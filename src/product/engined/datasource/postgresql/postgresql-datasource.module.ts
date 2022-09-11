import {Module} from '@nestjs/common';
import {PostgresqlDatasourceController} from './postgresql-datasource.controller';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceController],
  providers: [PostgresqlDatasourceService],
  exports: [PostgresqlDatasourceService],
})
export class PostgresqlDatasourceModule {}
