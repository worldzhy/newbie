import {ElasticsearchDatasource, PostgresqlDatasource} from '@prisma/client';
import {PostgresqlDatasourceController} from '@application/engined/datasource/postgresql/postgresql-datasource.controller';
import {ElasticsearchDatasourceController} from '@application/engined/datasource/elasticsearch/elasticsearch-datasource.controller';
import {DatatransPipelineController} from '@application/engined/datatrans/pipeline/pipeline.controller';

export async function seedForEngined() {
  // Seed datasource module.
  // console.log('* Creating postgresql and elasticsearch datasources...');
  // const postgresqlDatasourceController = new PostgresqlDatasourceController();
  // const elasticsearchDatasourceController =
  //   new ElasticsearchDatasourceController();
  // let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  // datasource = await postgresqlDatasourceController.createPostgresqlDatasource({
  //   host: '127.0.0.1',
  //   port: 5432,
  //   database: 'postgres',
  //   schema: 'application/account',
  // });
  // await postgresqlDatasourceController.loadPostgresqlDatasource(datasource.id);
  // datasource =
  //   await elasticsearchDatasourceController.createElasticsearchDatasource({
  //     node: 'http://127.0.0.1',
  //   });
  // await elasticsearchDatasourceController.loadElasticsearchDatasource(
  //   datasource.id
  // );
  // // Seed datatrans module.
  // console.log('* Creating datatrans pipeline...');
  // const pipelineController = new DatatransPipelineController();
  // await pipelineController.createPipeline({
  //   name: 'pg2es_pipeline',
  //   hasManyTables: [],
  //   belongsToTables: [],
  //   fromTableId: 1,
  //   toIndexId: 1,
  // });
}
