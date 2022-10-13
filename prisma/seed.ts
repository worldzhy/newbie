import {
  ElasticsearchDatasource,
  PostgresqlDatasource,
  TrustedEntityType,
} from '@prisma/client';
import {AccountController} from '../src/applications/account/account.controller';
import {ProjectController} from '../src/applications/pmgmt/project/project.controller';
import {DatatransPipelineController} from '../src/applications/engined/datatrans/pipeline/pipeline.controller';
import {ElasticsearchDatasourceController} from '../src/applications/engined/datasource/elasticsearch/elasticsearch-datasource.controller';
import {PostgresqlDatasourceController} from '../src/applications/engined/datasource/postgresql/postgresql-datasource.controller';
import {PermissionController} from '../src/applications/account/authorization/permission/permission.controller';
import {OrganizationController} from '../src/applications/account/organization/organization.controller';
import {RoleController} from '../src/applications/account/organization/role/role.controller';

// Auth
const authController = new AccountController();
const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
    userToRoles: {create: [{role: {create: {name: 'SUPER'}}}]},
  },
];

// Permission
const permissionController = new PermissionController();

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

  console.log('* [account] organization');
  const organizationController = new OrganizationController();
  const organization = await organizationController.createOrganization({
    name: 'InceptionPad',
  });

  console.log('* [account] organization role');
  const roleController = new RoleController();
  const role = await roleController.createRole({
    name: 'SUPER',
    organizationId: organization.id,
  });

  console.log('* [account] role permissions');
  const resources = permissionController.listPermissionResources();
  const actions = permissionController.listPermissionActions();
  for (const resource of resources) {
    for (const action of actions) {
      await permissionController.createPermission({
        resource,
        action,
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      });
    }
  }

  console.log('* [account] organization user');
  await authController.signup({
    username: 'henry',
    password: 'Abc1234!',
    userToRoles: {create: [{roleId: role.id}]},
  });

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
