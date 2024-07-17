import {userPrismaMiddleware} from '@microservices/account/user/user.prisma.middleware';
import {
  PermissionAction,
  Prisma,
  PrismaClient,
  TrustedEntityType,
} from '@prisma/client';

export async function seedForSolidcore() {
  const prisma = new PrismaClient();
  prisma.$use(userPrismaMiddleware);

  console.log('- Creating roles, permissions and users...');

  const RoleName = {
    Admin: 'Admin',
    EventManager: 'Event Manager',
    EventHost: 'Event Host',
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
    {name: RoleName.EventManager},
    {name: RoleName.EventHost},
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = await prisma.role.create({data: roles[i]});

    if (role.name === RoleName.Admin) {
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
    } else if (role.name === RoleName.EventHost) {
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'jim@solidcore.com',
          roles: {connect: [{id: role.id}]},
          profile: {create: {firstName: 'Jim', lastName: 'Green'}},
        },
      });
      await prisma.user.create({
        data: {
          password: 'Abc1234!',
          email: 'kate@solidcore.com',
          roles: {connect: [{id: role.id}]},
          profile: {create: {firstName: 'Kate', lastName: 'Smith'}},
        },
      });
    }
  }

  console.log('- Creating tag groups...');

  await prisma.tagGroup.createMany({
    data: [{name: 'Coach'}, {name: 'Location'}, {name: 'Installment'}],
  });

  console.log('- Creating tags...');
  await prisma.tag.createMany({
    data: [
      {
        name: 'TBD',
        groupId: 1,
      },
      {
        name: 'Installment A',
        groupId: 3,
      },
      {
        name: 'Installment B',
        groupId: 3,
      },
      {
        name: 'Installment C',
        groupId: 3,
      },
    ],
  });

  console.log('- Creating event types...');

  await prisma.eventType.createMany({
    data: [
      {
        name: 'Full Body',
        minutesOfDuration: 50,
        tagId: 2,
      },
      {
        name: 'Buns + Guns',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Arms + Abs',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Buns + Abs',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Foundations',
        minutesOfDuration: 50,
        tagId: 3,
      },
      {
        name: 'Beginner50',
        minutesOfDuration: 50,
        tagId: 3,
      },
      {
        name: '30min Express: Core + Lower Body',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: '30min Express: Core + Obliques',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: '30min Express: Core + Upper Body',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: 'coach-in-training',
        minutesOfDuration: 50,
        tagId: 2,
      },
      {
        name: 'Advanced Supersolid 65min',
        minutesOfDuration: 65,
        tagId: 4,
      },
      {
        name: 'Advanced Full Body',
        minutesOfDuration: 65,
        tagId: 4,
      },
      {
        name: "Advanced SuperSolid - Solidcore's 10th Anniversary Class!",
        minutesOfDuration: 65,
        tagId: 4,
      },
    ],
  });
}
