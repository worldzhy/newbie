import {userPrismaMiddleware} from '@microservices/account/user/user.prisma.middleware';
import {
  PermissionAction,
  Prisma,
  PrismaClient,
  TrustedEntityType,
} from '@prisma/client';

async function main() {
  console.log('**Seeding Start');

  const prisma = new PrismaClient();
  prisma.$use(userPrismaMiddleware);

  console.log('- Creating roles, permissions and users...');
  const user = await prisma.user.create({
    data: {
      email: 'admin@newbie.com',
      password: 'Abc1234!',
    },
  });

  const permissions = {
    Admin: [
      {
        action: PermissionAction.Manage,
        resource: Prisma.ModelName.Organization,
        where: undefined,
        trustedEntityType: TrustedEntityType.USER,
      },
      {
        action: PermissionAction.Manage,
        resource: Prisma.ModelName.User,
        where: undefined,
        trustedEntityType: TrustedEntityType.USER,
      },
      {
        action: PermissionAction.Manage,
        resource: Prisma.ModelName.Role,
        where: undefined,
        trustedEntityType: TrustedEntityType.USER,
      },
      {
        action: PermissionAction.Manage,
        resource: Prisma.ModelName.Permission,
        where: undefined,
        trustedEntityType: TrustedEntityType.USER,
      },
    ],
  };

  for (const permission of permissions.Admin) {
    await prisma.permission.create({
      data: {
        action: permission.action,
        resource: permission.resource,
        where: permission.where,
        trustedEntityType: permission.trustedEntityType,
        trustedEntityId: user.id,
      },
    });
  }

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
