import {Module} from '@nestjs/common';
import {PostgresqlDatasourceConstraintController} from './constraint.controller';
import {PostgresqlDatasourceConstraintService} from './constraint.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceConstraintController],
  providers: [PostgresqlDatasourceConstraintService],
  exports: [PostgresqlDatasourceConstraintService],
})
export class PostgresqlDatasourceConstraintModule {}
