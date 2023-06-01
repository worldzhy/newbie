import {PermissionAction, Prisma, TrustedEntityType} from '@prisma/client';
import {AccountController} from '../../src/application/account/account.controller';
import {OrganizationController} from '../../src/application/account/user/organization/organization.controller';
import {RoleController} from '../../src/application/account/user/role/role.controller';
import {PermissionController} from '../../src/application/account/authorization/permission/permission.controller';
import {WorkflowController} from '../../src/microservices/workflow/workflow.controller';
import {WorkflowRouteController} from '../../src/microservices/workflow/route/route.controller';
import {WorkflowViewController} from '../../src/microservices/workflow/view/view.controller';
import {WorkflowStateController} from '../../src/microservices/workflow/state/state.controller';

export async function seedForRecruitment() {
  // Seed workflow data.
  console.log('* Creating workflow routes...');

  const workflowController = new WorkflowController();
  const workflowRouteController = new WorkflowRouteController();
  const workflowViewController = new WorkflowViewController();
  const workflowStateController = new WorkflowStateController();

  const workflow = await workflowController.createWorkflow({
    name: 'Recruitment Workflow',
  });

  const views = [
    {workflowId: workflow.id, view: 'START', startSign: true},
    {workflowId: workflow.id, view: 'STEP1_DISPATCH'},
    {workflowId: workflow.id, view: 'STEP2_TEST'},
    {workflowId: workflow.id, view: 'STEP3_REVIEW'},
    {workflowId: workflow.id, view: 'END'},
  ];
  for (let i = 0; i < views.length; i++) {
    await workflowViewController.createWorkflowView(views[i]);
  }

  const states = [
    {workflowId: workflow.id, state: 'Pending Dispatch'}, // [Recruiter] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {workflowId: workflow.id, state: 'Pending Test'}, // [Referral Coordinator] assign to [Provider] to work on STEP2_TEST screen

    {workflowId: workflow.id, state: 'Pass'}, // [Provider] finish the process
    {workflowId: workflow.id, state: 'Fail'}, // [Provider] finish the process
    {workflowId: workflow.id, state: 'Discontinue'}, // [Provider] finish the process
    {workflowId: workflow.id, state: 'Termed-Secondary Medical Hold'}, // [Provider] finish the process
    {workflowId: workflow.id, state: 'Cancelled'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {workflowId: workflow.id, state: 'Cancelled - CV hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {workflowId: workflow.id, state: 'Cancelled - Medical Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {workflowId: workflow.id, state: 'CV Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {workflowId: workflow.id, state: 'Lab Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {workflowId: workflow.id, state: 'Late'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {workflowId: workflow.id, state: 'Medical Hold'}, // [Provider] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {workflowId: workflow.id, state: 'Reschedule'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {workflowId: workflow.id, state: 'D-Failed'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'MD-CLR'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'MD-CLR-P-CV'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'MD-CLR-WL'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'MD-DISC'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'MD-NOT-CLR'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'Terminated'}, // [Secondary Reviewer] finish the process
    {workflowId: workflow.id, state: 'Reviewer Hold'}, // [Secondary Reviewer] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {workflowId: workflow.id, state: 'Resubmission'}, // [Secondary Reviewer] assign to [Provider] to work on STEP2_TEST screen
  ];
  for (let i = 0; i < states.length; i++) {
    await workflowStateController.createWorkflowState(states[i]);
  }

  const routesOfEnd = [
    {
      workflowId: workflow.id,
      view: 'STEP2_TEST',
      state: 'Pass',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP2_TEST',
      state: 'Fail',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP2_TEST',
      state: 'Discontinue',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP2_TEST',
      state: 'Termed-Secondary Medical Hold',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'D-Failed',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'MD-CLR',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'MD-CLR-P-CV',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'MD-CLR-WL',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'MD-DISC',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'MD-NOT-CLR',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'STEP3_REVIEW',
      state: 'Terminated',
      nextView: 'END',
    },
  ];
  for (let i = 0; i < routesOfEnd.length; i++) {
    await workflowRouteController.createWorkflowRoute(routesOfEnd[i]);
  }

  // Seed account data.
  console.log('* Creating organization, roles, admin user and permissions...');

  const organizationController = new OrganizationController();
  const roleController = new RoleController();
  const authController = new AccountController();
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
      await authController.signup({
        username: 'admin02',
        email: 'admin02@hd.com',
        password: 'HDpwd@2022',
        userToRoles: {create: [{roleId: role.id}]},
      });
    } else if (role.name === RoleName.Recruiter) {
      // Create user with this role.
      await authController.signup({
        username: 'recruiter02',
        email: 'recruiter02@hd.com',
        password: 'HDpwd@2022',
        userToRoles: {create: [{roleId: role.id}]},
      });
    } else if (role.name === RoleName.Dispatcher) {
      // Create user with this role.
      await authController.signup({
        username: 'dispatcher02',
        email: 'dispatcher02@hd.com',
        password: 'HDpwd@2022',
        userToRoles: {create: [{roleId: role.id}]},
      });

      // Create workflow routes.
      const routes: Prisma.WorkflowRouteUncheckedCreateInput[] = [
        {
          workflowId: workflow.id,
          view: 'START',
          state: 'Pending Dispatch',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Cancelled',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Cancelled - CV hold',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Cancelled - Medical Hold',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'CV Hold',
          nextView: 'STEP2_TEST',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Lab Hold',
          nextView: 'STEP2_TEST',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Late',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Reschedule',
          nextView: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
      ];
      for (let i = 0; i < routes.length; i++) {
        await workflowRouteController.createWorkflowRoute(routes[i]);
      }
    } else if (role.name === RoleName.Provider) {
      // Create user with this role.
      await authController.signup({
        username: 'provider02',
        email: 'provider02@hd.com',
        password: 'HDpwd@2022',
        userToRoles: {create: [{roleId: role.id}]},
      });

      // Create routes.
      const routes: Prisma.WorkflowRouteUncheckedCreateInput[] = [
        {
          workflowId: workflow.id,
          view: 'STEP1_DISPATCH',
          state: 'Pending Test',
          nextView: 'STEP2_TEST',
          nextRoleId: role.id, // [Provider]
        },
        {
          workflowId: workflow.id,
          view: 'STEP3_REVIEW',
          state: 'Resubmission',
          nextView: 'STEP2_TEST',
          nextRoleId: role.id, // [Provider]
        },
      ];
      for (let i = 0; i < routes.length; i++) {
        await workflowRouteController.createWorkflowRoute(routes[i]);
      }
    } else if (role.name === RoleName.Reviewer) {
      // Create user with this role.
      await authController.signup({
        username: 's_reviewer02',
        email: 's_reviewer02@hd.com',
        password: 'HDpwd@2022',
        userToRoles: {create: [{roleId: role.id}]},
      });

      // Create routes.
      const routes: Prisma.WorkflowRouteUncheckedCreateInput[] = [
        {
          workflowId: workflow.id,
          view: 'STEP2_TEST',
          state: 'Medical Hold',
          nextView: 'STEP3_REVIEW',
          nextRoleId: role.id, // [Secondary Reviewer]
        },
        {
          workflowId: workflow.id,
          view: 'STEP3_REVIEW',
          state: 'Reviewer Hold',
          nextView: 'STEP3_REVIEW',
          nextRoleId: role.id, // [Secondary Reviewer]
        },
      ];
      for (let i = 0; i < routes.length; i++) {
        await workflowRouteController.createWorkflowRoute(routes[i]);
      }
    }
  }
}
