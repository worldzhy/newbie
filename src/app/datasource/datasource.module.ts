import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {ElasticsearchDatasourceModule} from './elasticsearch/elasticsearch-datasource.module';
import {ElasticsearchDatasourceIndexFieldModule} from './elasticsearch/index-field/index-field.module';
import {PostgresqlDatasourceModule} from './postgresql/postgresql-datasource.module';
import {PostgresqlDatasourceTableColumnModule} from './postgresql/table-column/table-column.module';
import {PostgresqlDatasourceTableRelationModule} from './postgresql/table-relation/table-relation.module';

@Module({
  imports: [
    PrismaModule,
    ElasticsearchDatasourceModule,
    ElasticsearchDatasourceIndexFieldModule,
    PostgresqlDatasourceModule,
    PostgresqlDatasourceTableColumnModule,
    PostgresqlDatasourceTableRelationModule,
  ],
})
export class DatasourceModule {}
