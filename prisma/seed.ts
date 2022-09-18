import {ElasticsearchDatasource, PostgresqlDatasource} from '@prisma/client';
import {AccountController} from '../src/application/account/account.controller';
import {ProjectController} from '../src/application/pmgmt/project/project.controller';
import {PostgresqlDatasourceService} from '../src/application/engined/datasource/postgresql/postgresql-datasource.service';
import {ElasticsearchDatasourceService} from '../src/application/engined/datasource/elasticsearch/elasticsearch-datasource.service';
import {DatatransPipelineController} from '../src/application/engined/datatrans/pipeline/pipeline.controller';

// Auth
const authController = new AccountController();
const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
  },
];

// Project
const projectController = new ProjectController();
const projects = [
  {
    name: 'Galaxy',
    clientName: 'Jim Green',
    clientEmail: 'jim@galaxy.com',
  },
  {
    name: 'InceptionPad',
  },
];

// Postgresql datasource
const postgresqlDatasourceService = new PostgresqlDatasourceService();
const postgresql = {
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  schema: 'public',
};

// Elasticsearch datasource
const elasticsearchDatasourceService = new ElasticsearchDatasourceService();
const elasticsearch = {node: '127.0.0.1'};

// Datatrans Pipeline
const pipelineController = new DatatransPipelineController();
const pipeline = {
  name: 'pg2es_pipeline',
  hasManyTables: [],
  belongsToTables: [],
  fromTableId: 16,
  toIndexId: 1,
};

async function main() {
  console.log('Start seeding ...');

  console.log('- users');
  for (const user of users) {
    await authController.signup(user);
  }

  console.log('- projects');
  for (const project of projects) {
    await projectController.createProject(project);
  }

  console.log('- datasources');
  let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  datasource = await postgresqlDatasourceService.create({data: postgresql});
  await postgresqlDatasourceService.mount(datasource);
  datasource = await elasticsearchDatasourceService.create({
    data: elasticsearch,
  });
  await elasticsearchDatasourceService.mount(datasource);

  console.log('- pipelines');
  await pipelineController.createPipeline(pipeline);

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
