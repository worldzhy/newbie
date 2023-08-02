import {
  PermissionAction,
  Prisma,
  PrismaClient,
  TrustedEntityType,
} from '@prisma/client';
import {generateHash} from '../../src/toolkit/utilities/common.util';

export async function seedForAccount() {
  const prisma = new PrismaClient();

  console.log('\n* Account Service');

  console.log('- Creating organization...');
  const organization = await prisma.organization.create({
    data: {name: 'InceptionPad'},
  });

  console.log('- Creating roles, permissions and users...');
  const RoleName = {
    Admin: 'Admin',
    Client: 'Client',
  };
  const permissionResources = Object.values(Prisma.ModelName);
  const permissionActions = Object.values(PermissionAction);

  const roles = [
    {
      name: RoleName.Admin,
      organizationId: organization.id,
    },
    {
      name: RoleName.Client,
      organizationId: organization.id,
    },
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = await prisma.role.create({data: roles[i]});

    // [Create permissions] 'manage', 'create', 'delete', 'read', 'update' permissions of all resources.
    for (const resource of permissionResources) {
      for (const action of permissionActions) {
        await prisma.permission.create({
          data: {
            resource,
            action,
            trustedEntityType: TrustedEntityType.ROLE,
            trustedEntityId: role.id,
          },
        });
      }
    }
    // [Create permissions] In the pending request screen, each role(except Admin) can only see the requests with testings those are waiting to be processed by the role.
    await prisma.permission.create({
      data: {
        action: PermissionAction.List,
        resource: Prisma.ModelName.JobApplication,
        where: {workflows: {some: {nextRoleId: role.id}}},
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      },
    });

    await prisma.permission.create({
      data: {
        action: PermissionAction.Get,
        resource: Prisma.ModelName.JobApplication,
        where: {workflows: {some: {nextRoleId: role.id}}},
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      },
    });

    if (role.name === RoleName.Admin) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 'admin',
          password: await generateHash('Abc1234!'),
          email: 'admin@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });
    } else if (role.name === RoleName.Client) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 'client',
          email: 'client@inceptionpad.com',
          password: await generateHash('Abc1234!'),
          roles: {connect: [{id: role.id}]},
        },
      });
    }
  }
}
