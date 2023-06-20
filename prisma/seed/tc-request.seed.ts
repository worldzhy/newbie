import {TrustedEntityType} from '@prisma/client';
import {AccountController} from '../../src/applications/account/account.controller';
import {RoleController} from '../../src/applications/account/role/role.controller';
import {PermissionController} from '../../src/applications/account/permission/permission.controller';
import {WorkflowController} from '../../src/microservices/workflow/workflow.controller';
import {WorkflowRouteController} from '../../src/microservices/workflow/route/route.controller';
import {WorkflowViewController} from '../../src/microservices/workflow/view/view.controller';
import {WorkflowStateController} from '../../src/microservices/workflow/state/state.controller';

export async function seedForTcRequest() {
  // Seed workflow data.
  console.log('* Creating workflow routes...');

  const workflowController = new WorkflowController();
  const workflowRouteController = new WorkflowRouteController();
  const workflowViewController = new WorkflowViewController();
  const workflowStateController = new WorkflowStateController();

  const workflow = await workflowController.createWorkflow({
    name: 'TC Workflow for Citizen',
  });

  const views = [
    {workflowId: workflow.id, view: 'START', startSign: true},
    {workflowId: workflow.id, view: 'DETAILS'},
    {workflowId: workflow.id, view: 'PURPOSE'},
    {workflowId: workflow.id, view: 'TYPE'},
    {workflowId: workflow.id, view: 'MARITAL'},
    {workflowId: workflow.id, view: 'EMPLOYMENT'},
    {workflowId: workflow.id, view: 'CITIZEN_TCUK_OR_OTHERS'},
    {workflowId: workflow.id, view: 'CITIZEN_TCUK'},
    {workflowId: workflow.id, view: 'CITIZEN_OTHERS'},
    {workflowId: workflow.id, view: 'CITIZEN_TC'},
    {workflowId: workflow.id, view: 'CITIZEN_UK'},
    {workflowId: workflow.id, view: 'PAYMENT'},
    {workflowId: workflow.id, view: 'COMPLETED'},
    {workflowId: workflow.id, view: 'END'},
  ];
  for (let i = 0; i < views.length; i++) {
    await workflowViewController.createWorkflowView(views[i]);
  }

  const states = [
    {workflowId: workflow.id, state: 'CONTINUE'},
    {workflowId: workflow.id, state: 'SUBMIT'},
    {workflowId: workflow.id, state: 'YES'},
    {workflowId: workflow.id, state: 'NO'},
    {workflowId: workflow.id, state: 'PAYMENT_SUCCEEDED'},
    {workflowId: workflow.id, state: 'PAYMENT_FAILED'},
    {workflowId: workflow.id, state: 'PASS'},
    {workflowId: workflow.id, state: 'FAIL'},
  ];
  for (let i = 0; i < states.length; i++) {
    await workflowStateController.createWorkflowState(states[i]);
  }

  const routes = [
    {
      workflowId: workflow.id,
      startSign: true,
      view: 'START',
      state: 'CONTINUE',
      nextView: 'DETAILS',
    },
    {
      workflowId: workflow.id,
      view: 'DETAILS',
      state: 'SUBMIT',
      nextView: 'PURPOSE',
    },
    {
      workflowId: workflow.id,
      view: 'PURPOSE',
      state: 'SUBMIT',
      nextView: 'TYPE',
    },
    {
      workflowId: workflow.id,
      view: 'TYPE',
      state: 'SUBMIT',
      nextView: 'MARITAL',
    },
    {
      workflowId: workflow.id,
      view: 'MARITAL',
      state: 'SUBMIT',
      nextView: 'EMPLOYMENT',
    },
    {
      workflowId: workflow.id,
      view: 'EMPLOYMENT',
      state: 'SUBMIT',
      nextView: 'CITIZEN_TCUK_OR_OTHERS',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_TCUK_OR_OTHERS',
      state: 'YES',
      nextView: 'CITIZEN_TCUK',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_TCUK_OR_OTHERS',
      state: 'NO',
      nextView: 'CITIZEN_OTHERS',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_TCUK',
      state: 'YES',
      nextView: 'CITIZEN_TC',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_TCUK',
      state: 'NO',
      nextView: 'CITIZEN_UK',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_TC',
      state: 'SUBMIT',
      nextView: 'PAYMENT',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_UK',
      state: 'SUBMIT',
      nextView: 'PAYMENT',
    },
    {
      workflowId: workflow.id,
      view: 'CITIZEN_OTHERS',
      state: 'SUBMIT',
      nextView: 'PAYMENT',
    },
    {
      workflowId: workflow.id,
      view: 'PAYMENT',
      state: 'PAYMENT_SUCCEEDED',
      nextView: 'COMPLETED',
    },
    {
      workflowId: workflow.id,
      view: 'PAYMENT',
      state: 'PAYMENT_FAILED',
      nextView: 'PAYMENT',
    },
    {
      workflowId: workflow.id,
      view: 'COMPLETED',
      state: 'PASS',
      nextView: 'END',
    },
    {
      workflowId: workflow.id,
      view: 'COMPLETED',
      state: 'FAIL',
      nextView: 'END',
    },
  ];
  for (let i = 0; i < routes.length; i++) {
    await workflowRouteController.createWorkflowRoute(routes[i]);
  }

  // Seed account data.
  console.log('* Creating roles, admin user and permissions...');

  const roleController = new RoleController();
  const authController = new AccountController();
  const permissionController = new PermissionController();
  const permissionResources = permissionController.listPermissionResources();
  const permissionActions = permissionController.listPermissionActions();
  const RoleName = {
    Admin: 'Admin',
    Officer: 'Officer',
  };

  const roles = [{name: RoleName.Admin}, {name: RoleName.Officer}];
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
    } else if (role.name === RoleName.Officer) {
      // Create user with this role.
      await authController.signup({
        username: 'officer01',
        email: 'officer01@tc.com',
        password: 'TCpwd@2023',
        userToRoles: {create: [{roleId: role.id}]},
      });
    }
  }
}
