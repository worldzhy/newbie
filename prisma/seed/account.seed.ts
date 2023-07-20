import {PermissionAction, Prisma, TrustedEntityType} from '@prisma/client';
import {AccountSignupController} from '../../src/application/account/account-signup.controller';
import {OrganizationController} from '../../src/application/account/organization/organization.controller';
import {RoleController} from '../../src/application/account/role/role.controller';
import {PermissionController} from '../../src/application/account/permission/permission.controller';

export async function seedForAccount() {
  // Seed account data.
  console.log('* Creating organization, roles, admin user and permissions...');

  const organizationController = new OrganizationController();
  const roleController = new RoleController();
  const signupController = new AccountSignupController();
  const permissionController = new PermissionController();
  const permissionResources = permissionController.listPermissionResources();
  const permissionActions = permissionController.listPermissionActions();
  const RoleName = {
    Admin: 'Admin',
    Recruiter: 'Recruiter',
    Dispatcher: 'Referral Coordinator',
    Provider: 'Provider and Reviewer',
    Reviewer: 'Secondary Reviewer',
  };

  const organization = await organizationController.createOrganization({
    name: 'InceptionPad',
  });
  const roles = [
    {
      name: RoleName.Admin,
      organizationId: organization.id,
    },
    {
      name: RoleName.Recruiter,
      organizationId: organization.id,
    },
    {
      name: RoleName.Dispatcher,
      organizationId: organization.id,
    },
    {
      name: RoleName.Provider,
      organizationId: organization.id,
    },
    {
      name: RoleName.Reviewer,
      organizationId: organization.id,
    },
  ];
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
      action: PermissionAction.List,
      resource: Prisma.ModelName.JobApplication,
      where: {workflows: {some: {nextRoleId: role.id}}},
      trustedEntityType: TrustedEntityType.ROLE,
      trustedEntityId: role.id,
    });

    await permissionController.createPermission({
      action: PermissionAction.Get,
      resource: Prisma.ModelName.JobApplication,
      where: {workflows: {some: {nextRoleId: role.id}}},
      trustedEntityType: TrustedEntityType.ROLE,
      trustedEntityId: role.id,
    });

    if (role.name === RoleName.Admin) {
      // Create user with this role.
      await signupController.signup({
        username: 'admin',
        password: 'Abc1234!',
        email: 'admin@inceptionpad.com',
        roles: {connect: [{id: role.id}]},
      });
      await signupController.signup({
        username: 'admin02',
        email: 'admin02@hd.com',
        password: 'HDpwd@2022',
        roles: {connect: [{id: role.id}]},
      });
    } else if (role.name === RoleName.Recruiter) {
      // Create user with this role.
      await signupController.signup({
        username: 'recruiter02',
        email: 'recruiter02@hd.com',
        password: 'HDpwd@2022',
        roles: {connect: [{id: role.id}]},
      });
    } else if (role.name === RoleName.Dispatcher) {
      // Create user with this role.
      await signupController.signup({
        username: 'dispatcher02',
        email: 'dispatcher02@hd.com',
        password: 'HDpwd@2022',
        roles: {connect: [{id: role.id}]},
      });
    } else if (role.name === RoleName.Provider) {
      // Create user with this role.
      await signupController.signup({
        username: 'provider02',
        email: 'provider02@hd.com',
        password: 'HDpwd@2022',
        roles: {connect: [{id: role.id}]},
      });
    } else if (role.name === RoleName.Reviewer) {
      // Create user with this role.
      await signupController.signup({
        username: 's_reviewer02',
        email: 's_reviewer02@hd.com',
        password: 'HDpwd@2022',
        roles: {connect: [{id: role.id}]},
      });
    }
  }
}
