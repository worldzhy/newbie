import {TrustedEntityType} from '@prisma/client';
import {AccountSignupController} from '../../src/application/account/account-signup.controller';
import {RoleController} from '../../src/application/account/role/role.controller';
import {PermissionController} from '../../src/application/account/permission/permission.controller';
import {ProjectController} from '../../src/application/pmgmt/project/project.controller';

export async function seedForPmgmt() {
  // Seed account data.
  console.log('* Creating roles, admin user and permissions...');

  const roleController = new RoleController();
  const signupController = new AccountSignupController();
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
      await signupController.signup({
        username: 'admin',
        password: 'Abc1234!',
        roles: {connect: [{id: role.id}]},
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
