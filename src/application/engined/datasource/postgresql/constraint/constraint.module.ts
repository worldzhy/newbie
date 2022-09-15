import {Module} from '@nestjs/common';
import {PostgresqlDatasourceConstraintService} from './constraint.service';
import {PrismaModule} from '../../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PostgresqlDatasourceConstraintService],
  exports: [PostgresqlDatasourceConstraintService],
})
export class PostgresqlDatasourceConstraintModule {}
