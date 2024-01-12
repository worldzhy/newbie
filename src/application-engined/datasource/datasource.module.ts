import {Module} from '@nestjs/common';
import {PostgresqlDatasourceController} from './postgresql/postgresql-datasource.controller';
import {PostgresqlDatasourceTableController} from './postgresql/table/table.controller';
import {PostgresqlDatasourceTableColumnController} from './postgresql/column/column.controller';
import {ElasticsearchDatasourceController} from './elasticsearch/elasticsearch-datasource.controller';
import {ElasticsearchDatasourceIndexController} from './elasticsearch/index/index.controller';
import {ElasticsearchDatasourceIndexFieldController} from './elasticsearch/field/field.controller';
import {PostgresqlDatasourceService} from './postgresql/postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './postgresql/table/table.service';
import {PostgresqlDatasourceTableColumnService} from './postgresql/column/column.service';
import {ElasticsearchDatasourceService} from './elasticsearch/elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexService} from './elasticsearch/index/index.service';

@Module({
  controllers: [
    PostgresqlDatasourceController,
    PostgresqlDatasourceTableController,
    PostgresqlDatasourceTableColumnController,
    ElasticsearchDatasourceController,
    ElasticsearchDatasourceIndexController,
    ElasticsearchDatasourceIndexFieldController,
  ],
  providers: [
    PostgresqlDatasourceService,
    PostgresqlDatasourceTableService,
    PostgresqlDatasourceTableColumnService,
    ElasticsearchDatasourceService,
    ElasticsearchDatasourceIndexService,
  ],
  exports: [
    PostgresqlDatasourceService,
    PostgresqlDatasourceTableService,
    PostgresqlDatasourceTableColumnService,
    ElasticsearchDatasourceService,
    ElasticsearchDatasourceIndexService,
  ],
})
export class DatasourceModule {}
