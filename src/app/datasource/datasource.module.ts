import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {DatasourceElasticsearchModule} from './elasticsearch/elasticsearch.module';
import {DatasourceElasticsearchIndexFieldModule} from './elasticsearch/index-field/index-field.module';
import {DatasourcePostgresqlModule} from './postgresql/postgresql.module';
import {DatasourcePostgresqlTableColumnModule} from './postgresql/table-column/table-column.module';
import {DatasourcePostgresqlTableRelationModule} from './postgresql/table-relation/table-relation.module';

@Module({
  imports: [
    PrismaModule,
    DatasourceElasticsearchModule,
    DatasourceElasticsearchIndexFieldModule,
    DatasourcePostgresqlModule,
    DatasourcePostgresqlTableColumnModule,
    DatasourcePostgresqlTableRelationModule,
  ],
})
export class DatasourceModule {}
