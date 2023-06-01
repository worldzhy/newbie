import {TrustedEntityType} from '@prisma/client';
import {AccountController} from '../../src/application/account/account.controller';
import {RoleController} from '../../src/application/account/user/role/role.controller';
import {PermissionController} from '../../src/application/account/authorization/permission/permission.controller';
import {ProjectController} from '../../src/application/pmgmt/project/project.controller';

export async function seedForPmgmt() {
  // Seed account data.
  console.log('* Creating roles, admin user and permissions...');

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

    if (role.name === RoleName.Admin) {
      // Create user with this role.
      await authController.signup({
        username: 'admin',
        password: 'Abc1234!',
        userToRoles: {create: [{roleId: role.id}]},
      });
    }
  }

  // Seed project management module.
  console.log('* Creating projects...');
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
}
