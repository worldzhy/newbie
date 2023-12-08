import {Module} from '@nestjs/common';
import {ElasticsearchDataboardController} from './databoard/elasticsearch/elasticsearch-databoard.controller';
import {ElasticsearchDataboardColumnController} from './databoard/elasticsearch/column/column.controller';
import {PostgresqlDatasourceController} from './datasource/postgresql/postgresql-datasource.controller';
import {PostgresqlDatasourceTableController} from './datasource/postgresql/table/table.controller';
import {PostgresqlDatasourceTableColumnController} from './datasource/postgresql/column/column.controller';
import {ElasticsearchDatasourceController} from './datasource/elasticsearch/elasticsearch-datasource.controller';
import {ElasticsearchDatasourceIndexController} from './datasource/elasticsearch/index/index.controller';
import {ElasticsearchDatasourceIndexFieldController} from './datasource/elasticsearch/field/field.controller';
import {DatatransPipelineController} from './datatrans/pipeline/pipeline.controller';
import {DatatransMissionController} from './datatrans/mission/mission.controller';
import {DatatransTaskController} from './datatrans/mission/task/task.controller';
import {PostgresqlDatasourceService} from './datasource/postgresql/postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './datasource/postgresql/table/table.service';
import {PostgresqlDatasourceTableColumnService} from './datasource/postgresql/column/column.service';
import {ElasticsearchDatasourceService} from './datasource/elasticsearch/elasticsearch-datasource.service';
import {ElasticsearchDatasourceIndexService} from './datasource/elasticsearch/index/index.service';
import {DatatransPipelineService} from './datatrans/pipeline/pipeline.service';

@Module({
  controllers: [
    ElasticsearchDataboardController,
    ElasticsearchDataboardColumnController,
    PostgresqlDatasourceController,
    PostgresqlDatasourceTableController,
    PostgresqlDatasourceTableColumnController,
    ElasticsearchDatasourceController,
    ElasticsearchDatasourceIndexController,
    ElasticsearchDatasourceIndexFieldController,
    DatatransPipelineController,
    DatatransMissionController,
    DatatransTaskController,
  ],
  providers: [
    PostgresqlDatasourceService,
    PostgresqlDatasourceTableService,
    PostgresqlDatasourceTableColumnService,
    ElasticsearchDatasourceService,
    ElasticsearchDatasourceIndexService,
    DatatransPipelineService,
  ],
  exports: [
    PostgresqlDatasourceService,
    PostgresqlDatasourceTableService,
    PostgresqlDatasourceTableColumnService,
    ElasticsearchDatasourceService,
    ElasticsearchDatasourceIndexService,
    DatatransPipelineService,
  ],
})
export class EnginedModule {}
