import {
  PermissionAction,
  Prisma,
  PrismaClient,
  TrustedEntityType,
} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';

export async function seedForRecruitment() {
  const prisma = new PrismaClient();
  prisma.$use(prismaMiddleware);

  console.log('- Creating roles, permissions and users...');

  const allPermissionResources = Object.values(Prisma.ModelName);
  const allPermissionActions = Object.values(PermissionAction);
  const RoleName = {
    OrgAdmin: 'OrgAdmin',
    Admin: 'Admin',
    Recruiter: 'Recruiter',
    Dispatcher: 'Referral Coordinator',
    Provider: 'Provider and Reviewer',
    Reviewer: 'Secondary Reviewer',
    MCUAdmin: 'MCU Admin',
    MCUReviewer: 'MCU Reviewer',
    MCUSuperAdmin: 'MCU Super Admin',
  };

  const roles = [
    {name: RoleName.Admin},
    {name: RoleName.Recruiter},
    {name: RoleName.Dispatcher},
    {name: RoleName.Provider},
    {name: RoleName.Reviewer},
    {name: RoleName.OrgAdmin},
    {name: RoleName.MCUAdmin},
    {name: RoleName.MCUSuperAdmin},
    {name: RoleName.MCUReviewer},
  ];

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

  const workflow = await prisma.workflow.create({
    data: {name: 'Recruitment Workflow 1'},
  });

  const views: Prisma.WorkflowViewCreateManyInput[] = [
    {name: 'START', workflowId: workflow.id},
    {name: 'STEP1_DISPATCH', workflowId: workflow.id},
    {name: 'STEP2_TEST', workflowId: workflow.id},
    {name: 'STEP3_REVIEW', workflowId: workflow.id},
    {name: 'END', workflowId: workflow.id},
  ];
  await prisma.workflowView.createMany({data: views});

  const states: Prisma.WorkflowStateCreateManyInput[] = [
    {name: 'Pending Dispatch', workflowId: workflow.id}, // [Recruiter] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {name: 'Pending Test', workflowId: workflow.id}, // [Referral Coordinator] assign to [Provider] to work on STEP2_TEST screen

    {name: 'Pass', workflowId: workflow.id}, // [Provider] finish the process
    {name: 'Fail', workflowId: workflow.id}, // [Provider] finish the process
    {name: 'Discontinue', workflowId: workflow.id}, // [Provider] finish the process
    {name: 'Termed-Secondary Medical Hold', workflowId: workflow.id}, // [Provider] finish the process
    {name: 'Cancelled', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {name: 'Cancelled - CV hold', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {name: 'Cancelled - Medical Hold', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {name: 'CV Hold', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {name: 'Lab Hold', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {name: 'Late', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {name: 'Medical Hold', workflowId: workflow.id}, // [Provider] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {name: 'Reschedule', workflowId: workflow.id}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {name: 'D-Failed', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'MD-CLR', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'MD-CLR-P-CV', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'MD-CLR-WL', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'MD-DISC', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'MD-NOT-CLR', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'Terminated', workflowId: workflow.id}, // [Secondary Reviewer] finish the process
    {name: 'Reviewer Hold', workflowId: workflow.id}, // [Secondary Reviewer] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {name: 'Resubmission', workflowId: workflow.id}, // [Secondary Reviewer] assign to [Provider] to work on STEP2_TEST screen
  ];
  await prisma.workflowState.createMany({data: states});

  // const routesForFinalStates:Prisma.WorkflowRouteCreateInput[] = [
  //   {view: {connect:{name_workflowId:{name:'STEP2_TEST',workflowId:workflow.id}}}, state: 'Pass', nextView: 'END',workflowId:workflow.id},
  //   {view: 'STEP2_TEST', state: 'Fail', nextView: 'END',workflowId:workflow.id},
  //   {view: 'STEP2_TEST', state: 'Discontinue', nextView: 'END',workflowId:workflow.id},
  //   {
  //     view: 'STEP2_TEST',
  //     state: 'Termed-Secondary Medical Hold',
  //     nextView: 'END',
  //   },
  //   {view: 'STEP3_REVIEW', state: 'D-Failed', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'MD-CLR', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'MD-CLR-P-CV', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'MD-CLR-WL', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'MD-DISC', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'MD-NOT-CLR', nextView: 'END'},
  //   {view: 'STEP3_REVIEW', state: 'Terminated', nextView: 'END'},
  // ];
  // for (let i = 0; i < workflowForfinalStates.length; i++) {
  //   await prisma.workflowRoute.create({data:
  //     routesForFinalStates[i]}
  //   );
  // }

  // for (let i = 0; i < roles.length; i++) {
  //   const role = await prisma.role.create({data: roles[i]});

  //   if (role.name === RoleName.Admin) {
  //     // Create user with this role.
  //     await prisma.user.create({
  //       data: {
  //         password: 'Abc1234!',
  //         email: 'admin@inceptionpad.com',
  //         roles: {connect: [{id: role.id}]},
  //       },
  //     });
  //     await prisma.user.create({
  //       data: {
  //         password: 'Abc1234!',
  //         email: 'liyue@inceptionpad.com',
  //         roles: {connect: [{id: role.id}]},
  //       },
  //     });
  //     await prisma.user.create({
  //       data: {
  //         password: 'Abc1234!',
  //         email: 'tan@inceptionpad.com',
  //         roles: {connect: [{id: role.id}]},
  //       },
  //     });

  //     // Create permissions.
  //     for (const permission of permissions.Admin) {
  //       await prisma.permission.create({
  //         data: {
  //           action: permission.action,
  //           resource: permission.resource,
  //           where: permission.where,
  //           trustedEntityType: permission.trustedEntityType,
  //           trustedEntityId: role.id,
  //         },
  //       });
  //     }
  //   }
  // }

  for (let i = 0; i < roles.length; i++) {
    const role = await prisma.role.create({data: roles[i]});

    // [Create permissions] In the pending request screen, each role(except Admin) can only see the requests with workflows those are waiting to be processed by the role.
    // await permissionController.createPermission({
    //   action: PermissionAction.read,
    //   resource: Prisma.ModelName.JobApplication,
    //   where: {workflows: {some: {nextRoleId: role.id}}},
    //   trustedEntityType: TrustedEntityType.ROLE,
    //   trustedEntityId: role.id,
    // });

    if (role.name === RoleName.MCUAdmin) {
      await prisma.user.create({
        data: {
          email: 'mcuAdmin@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.MCUSuperAdmin) {
      await prisma.user.create({
        data: {
          email: 'mcuSuperAdmin@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.MCUReviewer) {
      await prisma.user.create({
        data: {
          email: 'mcuReviewer@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.Admin) {
      await prisma.user.create({
        data: {
          email: 'admin@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.OrgAdmin) {
      await prisma.user.create({
        data: {
          email: 'orgAdmin@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.Recruiter) {
      await prisma.user.create({
        data: {
          email: 'recruiter@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });
    }
    if (role.name === RoleName.Dispatcher) {
      await prisma.user.create({
        data: {
          email: 'dispatcher@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });

      // Create workflow routes.
      // const routes: Prisma.WorkflowRouteCreateInput[] = [
      //   {
      //     startSign: true,
      //     view: 'START',
      //     state: 'Pending Dispatch',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Cancelled',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Cancelled - CV hold',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Cancelled - Medical Hold',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'CV Hold',
      //     nextView: 'STEP2_TEST',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Lab Hold',
      //     nextView: 'STEP2_TEST',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: {'STEP2_TEST'},
      //     state: 'Late',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Reschedule',
      //     nextView: 'STEP1_DISPATCH',
      //     nextRoleId: role.id, // [Referral Coordinator]
      //   },
      // ];
      // for (let i = 0; i < routes.length; i++) {
      //   await prisma.workflowRoute.create({data: routes[i]});
      // }
    }
    if (role.name === RoleName.Provider) {
      await prisma.user.create({
        data: {
          email: 'provider@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });

      // Create routes.
      // const routes: Prisma.WorkflowRouteCreateInput[] = [
      //   {
      //     view: 'STEP1_DISPATCH',
      //     state: 'Pending Test',
      //     nextView: 'STEP2_TEST',
      //     nextRoleId: role.id, // [Provider]
      //   },
      //   {
      //     view: 'STEP3_REVIEW',
      //     state: 'Resubmission',
      //     nextView: 'STEP2_TEST',
      //     nextRoleId: role.id, // [Provider]
      //   },
      // ];
      // for (let i = 0; i < routes.length; i++) {
      //   await workflowRouteController.createWorkflowRoute(routes[i]);
      // }
    }
    if (role.name === RoleName.Reviewer) {
      await prisma.user.create({
        data: {
          email: 'reviewer@inceptionpad.com',
          password: 'Abc1234!',
          roles: {connect: [{id: role.id}]},
        },
      });

      // Create routes.
      // const routes: Prisma.WorkflowRouteCreateInput[] = [
      //   {
      //     view: 'STEP2_TEST',
      //     state: 'Medical Hold',
      //     nextView: 'STEP3_REVIEW',
      //     nextRoleId: role.id, // [Secondary Reviewer]
      //   },
      //   {
      //     view: 'STEP3_REVIEW',
      //     state: 'Reviewer Hold',
      //     nextView: 'STEP3_REVIEW',
      //     nextRoleId: role.id, // [Secondary Reviewer]
      //   },
      // ];
      // for (let i = 0; i < routes.length; i++) {
      //   await workflowRouteController.createWorkflowRoute(routes[i]);
      // }
    }
  }
}
