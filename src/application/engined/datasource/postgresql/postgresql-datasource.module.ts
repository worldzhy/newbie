import {Module} from '@nestjs/common';
import {PostgresqlDatasourceController} from './postgresql-datasource.controller';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PrismaModule} from '../../../../tools/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceController],
  providers: [PostgresqlDatasourceService],
  exports: [PostgresqlDatasourceService],
})
export class PostgresqlDatasourceModule {}
