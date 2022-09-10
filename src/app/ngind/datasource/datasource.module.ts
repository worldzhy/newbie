import {Module} from '@nestjs/common';
import {ElasticsearchDatasourceModule} from './elasticsearch/elasticsearch-datasource.module';
import {ElasticsearchDatasourceIndexModule} from './elasticsearch/index/index.module';
import {ElasticsearchDatasourceIndexFieldModule} from './elasticsearch/field/field.module';
import {PostgresqlDatasourceModule} from './postgresql/postgresql-datasource.module';
import {PostgresqlDatasourceTableModule} from './postgresql/table/table.module';
import {PostgresqlDatasourceTableColumnModule} from './postgresql/column/column.module';
import {PostgresqlDatasourceConstraintModule} from './postgresql/constraint/constraint.module';

@Module({
  imports: [
    ElasticsearchDatasourceModule,
    ElasticsearchDatasourceIndexModule,
    ElasticsearchDatasourceIndexFieldModule,
    PostgresqlDatasourceModule,
    PostgresqlDatasourceTableModule,
    PostgresqlDatasourceTableColumnModule,
    PostgresqlDatasourceConstraintModule,
  ],
})
export class DatasourceModule {}
