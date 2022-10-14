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

async function main() {
  console.log('Start seeding ...');

  // Seed account module.
  console.log('* Create organization, roles, admin user and permissions');
  const organizationController = new OrganizationController();
  const roleController = new RoleController();
  const authController = new AccountController();
  const permissionController = new PermissionController();
  const permissionResources = permissionController.listPermissionResources();
  const permissionActions = permissionController.listPermissionActions();

  const organization = await organizationController.createOrganization({
    name: 'InceptionPad',
  });

  const roles = [
    {
      name: 'Admin',
      organizationId: organization.id,
    },
    {
      name: 'Recruiter',
      organizationId: organization.id,
    },
    {
      name: 'Dispatcher',
      organizationId: organization.id,
    },
    {
      name: 'Tester',
      organizationId: organization.id,
    },
    {
      name: 'Reviewer',
      organizationId: organization.id,
    },
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = await roleController.createRole(roles[i]);
    if (role.name === 'Admin') {
      // Add all permissions to Admin role.
      for (const resource of permissionResources) {
        for (const action of permissionActions) {
          await permissionController.createPermission({
            resource,
            action,
            trustedEntityType: TrustedEntityType.ROLE,
            trustedEntityId: role.id,
          });
        }
      }
      // Create an user with Admin role.
      await authController.signup({
        username: 'admin',
        password: 'Abc1234!',
        userToRoles: {create: [{roleId: role.id}]},
      });
    }
  }

  // Seed project management module.
  console.log('* Create projects');
  const projectController = new ProjectController();
  const projects = [
    {
      name: 'Galaxy',
      clientName: 'Jim Green',
      clientEmail: 'jim@galaxy.com',
    },
    {name: 'InceptionPad'},
  ];
  for (const project of projects) {
    await projectController.createProject(project);
  }

  // Seed datasource module.
  console.log('* Create postgresql and elasticsearch datasources');
  const postgresqlDatasourceController = new PostgresqlDatasourceController();
  const elasticsearchDatasourceController =
    new ElasticsearchDatasourceController();
  let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  datasource = await postgresqlDatasourceController.createPostgresqlDatasource({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    schema: 'application/account',
  });
  await postgresqlDatasourceController.loadPostgresqlDatasource(datasource.id);

  datasource =
    await elasticsearchDatasourceController.createElasticsearchDatasource({
      node: '127.0.0.1',
    });
  await elasticsearchDatasourceController.loadElasticsearchDatasource(
    datasource.id
  );

  // Seed datatrans module.
  console.log('* Create datatrans pipeline');
  const pipelineController = new DatatransPipelineController();
  await pipelineController.createPipeline({
    name: 'pg2es_pipeline',
    hasManyTables: [],
    belongsToTables: [],
    fromTableId: 1,
    toIndexId: 1,
  });

  // Seeding Finished.
  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
