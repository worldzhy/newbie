import {ConfigService} from '@nestjs/config';
import {PermissionAction, Prisma, TrustedEntityType} from '@prisma/client';
import {CustomLoggerService} from '../../src/toolkit/logger/logger.service';
import {PrismaService} from '../../src/toolkit/prisma/prisma.service';
import {SqsService} from '../../src/toolkit/aws/aws.sqs.service';

export async function seedForAccount() {
  const prisma = new PrismaService(
    new CustomLoggerService(
      new ConfigService(),
      new SqsService(new ConfigService())
    )
  );

  // Seed account data.
  console.log('* Creating organization, roles, admin user and permissions...');

  const permissionResources = Object.values(Prisma.ModelName);
  const permissionActions = Object.values(PermissionAction);
  const RoleName = {
    Admin: 'Admin',
    Recruiter: 'Recruiter',
    Dispatcher: 'Referral Coordinator',
    Provider: 'Provider and Reviewer',
    Reviewer: 'Secondary Reviewer',
  };

  const organization = await prisma.organization.create({
    data: {name: 'InceptionPad'},
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
          password: 'Abc1234!',
          email: 'admin@inceptionpad.com',
          roles: {connect: [{id: role.id}]},
        },
      });
      await prisma.user.create({
        data: {
          username: 'admin02',
          email: 'admin02@hd.com',
          password: 'HDpwd@2022',
          roles: {connect: [{id: role.id}]},
        },
      });
    } else if (role.name === RoleName.Recruiter) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 'recruiter02',
          email: 'recruiter02@hd.com',
          password: 'HDpwd@2022',
          roles: {connect: [{id: role.id}]},
        },
      });
    } else if (role.name === RoleName.Dispatcher) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 'dispatcher02',
          email: 'dispatcher02@hd.com',
          password: 'HDpwd@2022',
          roles: {connect: [{id: role.id}]},
        },
      });
    } else if (role.name === RoleName.Provider) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 'provider02',
          email: 'provider02@hd.com',
          password: 'HDpwd@2022',
          roles: {connect: [{id: role.id}]},
        },
      });
    } else if (role.name === RoleName.Reviewer) {
      // Create user with this role.
      await prisma.user.create({
        data: {
          username: 's_reviewer02',
          email: 's_reviewer02@hd.com',
          password: 'HDpwd@2022',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
  }
}
