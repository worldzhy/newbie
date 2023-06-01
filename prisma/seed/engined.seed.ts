import {
  ElasticsearchDatasource,
  PermissionAction,
  PostgresqlDatasource,
  Prisma,
  TrustedEntityType,
} from '@prisma/client';
import {AccountController} from '../../src/application/account/account.controller';
import {RoleController} from '../../src/application/account/user/role/role.controller';
import {PermissionController} from '../../src/application/account/authorization/permission/permission.controller';
import {PostgresqlDatasourceController} from '../../src/application/engined/datasource/postgresql/postgresql-datasource.controller';
import {ElasticsearchDatasourceController} from '../../src/application/engined/datasource/elasticsearch/elasticsearch-datasource.controller';
import {DatatransPipelineController} from '../../src/application/engined/datatrans/pipeline/pipeline.controller';

export async function seedForEngined() {
  // Seed account data.
  console.log('* Creating organization, roles, admin user and permissions...');

  const roleController = new RoleController();
  const authController = new AccountController();
  const permissionController = new PermissionController();
  const permissionResources = permissionController.listPermissionResources();
  const permissionActions = permissionController.listPermissionActions();
  const RoleName = {Admin: 'Admin'};

  const roles = [{name: RoleName.Admin}];
  for (let i = 0; i < roles.length; i++) {
    const role = await roleController.createRole(roles[i]);

    // [Create permissions] 'manage', 'create', 'delete', 'read', 'update' permissions of all resources.
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
    // [Create permissions] In the pending request screen, each role(except Admin) can only see the requests with testings those are waiting to be processed by the role.
    await permissionController.createPermission({
      action: PermissionAction.read,
      resource: Prisma.ModelName.JobApplication,
      where: {workflows: {some: {nextRoleId: role.id}}},
      trustedEntityType: TrustedEntityType.ROLE,
      trustedEntityId: role.id,
    });

    if (role.name === RoleName.Admin) {
      // Create user with this role.
      await authController.signup({
        username: 'admin',
        password: 'Abc1234!',
        userToRoles: {create: [{roleId: role.id}]},
      });
    }
  }

  // Seed datasource module.
  console.log('* Creating postgresql and elasticsearch datasources...');
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
      node: 'http://127.0.0.1',
    });
  await elasticsearchDatasourceController.loadElasticsearchDatasource(
    datasource.id
  );

  // Seed datatrans module.
  console.log('* Creating datatrans pipeline...');
  const pipelineController = new DatatransPipelineController();
  await pipelineController.createPipeline({
    name: 'pg2es_pipeline',
    hasManyTables: [],
    belongsToTables: [],
    fromTableId: 1,
    toIndexId: 1,
  });
}
