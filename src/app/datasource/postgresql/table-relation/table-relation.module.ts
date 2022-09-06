import {Module} from '@nestjs/common';
import {PostgresqlDatasourceTableRelationController} from './table-relation.controller';
import {PostgresqlDatasourceTableRelationService} from './table-relation.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostgresqlDatasourceTableRelationController],
  providers: [PostgresqlDatasourceTableRelationService],
  exports: [PostgresqlDatasourceTableRelationService],
})
export class PostgresqlDatasourceTableRelationModule {}
