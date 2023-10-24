import {
  PermissionAction,
  Prisma,
  PrismaClient,
  TrustedEntityType,
} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';

export async function seedForAccount() {
  const prisma = new PrismaClient();
  prisma.$use(prismaMiddleware);

  console.log('\n* Account Service');
  console.log('- Creating roles, permissions and users...');

  const RoleName = {
    Admin: 'Admin',
    Manager: 'Area Manager',
    Coach: 'Coach',
  };

  const permissions = {
    Admin: [
      {
        action: PermissionAction.Manage,
        resource: Prisma.ModelName.User,
        where: undefined,
        trustedEntityType: TrustedEntityType.ROLE,
      },
    ],
  };

  const roles = [
    {name: RoleName.Admin},
    {name: RoleName.Manager},
    {name: RoleName.Coach},
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = await prisma.role.create({data: roles[i]});

    if (role.name === RoleName.Admin) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'admin@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'liyue@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'tan@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'chuck@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });

      // Create permissions.
      for (const permission of permissions.Admin) {
        await prisma.permission.create({
          data: {
            action: permission.action,
            resource: permission.resource,
            where: permission.where,
            trustedEntityType: permission.trustedEntityType,
            trustedEntityId: role.id,
          },
        });
      }
    }
  }
}
