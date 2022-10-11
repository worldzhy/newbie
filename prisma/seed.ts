import {ElasticsearchDatasource, PostgresqlDatasource} from '@prisma/client';
import {AccountController} from '../src/application/account/account.controller';
import {RoleController} from '../src/application/account/role/role.controller';
import {ProjectController} from '../src/application/pmgmt/project/project.controller';
import {DatatransPipelineController} from '../src/application/engined/datatrans/pipeline/pipeline.controller';
import {ElasticsearchDatasourceController} from '../src/application/engined/datasource/elasticsearch/elasticsearch-datasource.controller';
import {PostgresqlDatasourceController} from '../src/application/engined/datasource/postgresql/postgresql-datasource.controller';

// Auth
const authController = new AccountController();
const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
    roles: {create: [{role: {create: {name: 'SUPER'}}}]},
  },
];

const roleController = new RoleController();
const roles = [{name: 'SUPER'}, {name: 'SUPER_ADMINISTRATOR'}];

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
const postgresqlDatasourceController = new PostgresqlDatasourceController();
const postgresql = {
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  schema: 'application/account',
};

// Elasticsearch datasource
const elasticsearchDatasourceController =
  new ElasticsearchDatasourceController();
const elasticsearch = {node: '127.0.0.1'};

// Datatrans Pipeline
const pipelineController = new DatatransPipelineController();
const pipeline = {
  name: 'pg2es_pipeline',
  hasManyTables: [],
  belongsToTables: [],
  fromTableId: 1,
  toIndexId: 1,
};

async function main() {
  console.log('Start seeding ...');

  console.log('* [account] user');
  for (const user of users) {
    await authController.signup(user);
  }

  // console.log('* [account] role');
  // for (const role of roles) {
  //   await roleController.createRole(role);
  // }

  console.log('* [project management] project');
  for (const project of projects) {
    await projectController.createProject(project);
  }

  console.log('* [engined][datasource] postgresql');
  let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  datasource = await postgresqlDatasourceController.createPostgresqlDatasource(
    postgresql
  );
  await postgresqlDatasourceController.loadPostgresqlDatasource(datasource.id);

  console.log('* [engined][datasource] elasticsearch');
  datasource =
    await elasticsearchDatasourceController.createElasticsearchDatasource(
      elasticsearch
    );
  await elasticsearchDatasourceController.loadElasticsearchDatasource(
    datasource.id
  );

  console.log('* [engined][datatrans] pipeline');
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
