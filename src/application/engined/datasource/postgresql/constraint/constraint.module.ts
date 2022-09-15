import {Module} from '@nestjs/common';
import {PostgresqlDatasourceConstraintService} from './constraint.service';
import {PrismaModule} from '../../../../../tools/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PostgresqlDatasourceConstraintService],
  exports: [PostgresqlDatasourceConstraintService],
})
export class PostgresqlDatasourceConstraintModule {}
