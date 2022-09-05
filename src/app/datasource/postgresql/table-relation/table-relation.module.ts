import {Module} from '@nestjs/common';
import {DatasourcePostgresqlTableRelationController} from './table-relation.controller';
import {DatasourcePostgresqlTableRelationService} from './table-relation.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatasourcePostgresqlTableRelationController],
  providers: [DatasourcePostgresqlTableRelationService],
  exports: [DatasourcePostgresqlTableRelationService],
})
export class DatasourcePostgresqlTableRelationModule {}
