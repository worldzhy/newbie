import {
  DatatransPipelineState,
  ElasticsearchDatasource,
  PostgresqlDatasource,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../src/_prisma/_prisma.service';
import {AccountService} from '../src/application/account/account.service';
import {AccountController} from '../src/application/account/account.controller';
import {RoleService} from '../src/application/account/role/role.service';
import {ProjectController} from '../src/application/pmgmt/project/project.controller';
import {PostgresqlDatasourceService} from '../src/application/engined/datasource/postgresql/postgresql-datasource.service';
import {ElasticsearchDatasourceService} from '../src/application/engined/datasource/elasticsearch/elasticsearch-datasource.service';
import {DatatransPipelineController} from '../src/application/engined/datatrans/pipeline/pipeline.controller';

const prisma = new PrismaService();

// Account
const accountService = new AccountService();
const accountController = new AccountController(accountService);
const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
  },
];

// Role
const roleService = new RoleService(prisma);
const roles: Prisma.RoleCreateInput[] = [
  {
    name: 'admin',
  },
  {
    name: 'user',
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
  state: DatatransPipelineState.IDLE,
  queueUrl:
    'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
  hasManyTables: [],
  belongsToTables: [],
  fromTableId: 16,
  toIndexId: 1,
};

async function main() {
  console.log('Start seeding ...');

  console.log('- users');
  for (const user of users) {
    await accountController.signup(user);
  }

  console.log('- roles');
  for (const role of roles) {
    await roleService.create(role);
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
