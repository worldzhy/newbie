import {TrustedEntityType} from '@prisma/client';
import {AccountController} from '../../src/applications/account/account.controller';
import {RoleController} from '../../src/applications/account/user/role/role.controller';
import {PermissionController} from '../../src/applications/account/authorization/permission/permission.controller';
import {WorkflowRouteController} from '../../src/microservices/workflow/route/route.controller';
import {WorkflowViewController} from '../../src/microservices/workflow/view/view.controller';
import {WorkflowStateController} from '../../src/microservices/workflow/state/state.controller';

export async function seedForTcRequest() {
  // Seed workflow data.
  console.log('* Creating workflow routes...');

  const workflowRouteController = new WorkflowRouteController();
  const workflowViewController = new WorkflowViewController();
  const workflowStateController = new WorkflowStateController();

  const views = [
    {view: 'START'},
    {view: 'VIEW1_DETAILS'},
    {view: 'VIEW2_PURPOSE'},
    {view: 'VIEW3_PAYMENT'},
    {view: 'VIEW4_TYPE'},
    {view: 'VIEW5_MARITAL'},
    {view: 'VIEW6_EMPLOYMENT'},
    {view: 'VIEW7_TCUK_?'},
    {view: 'VIEW8_TCUK_YES'},
    {view: 'VIEW9_TCUK_NO'},
    {view: 'VIEW10_TCUK_YES_TC'},
    {view: 'VIEW11_TCUK_YES_UK'},
    {view: 'VIEW12_COMPLETED'},
    {view: 'END'},
  ];
  for (let i = 0; i < views.length; i++) {
    await workflowViewController.createWorkflowView(views[i]);
  }

  const states = [
    {state: 'CONTINUE'},
    {state: 'SUBMIT'},
    {state: 'YES'},
    {state: 'NO'},
    {state: 'PASS'},
    {state: 'FAIL'},
  ];
  for (let i = 0; i < states.length; i++) {
    await workflowStateController.createWorkflowState(states[i]);
  }

  const routes = [
    {
      startSign: true,
      view: 'START',
      state: 'CONTINUE',
      nextView: 'VIEW1_DETAILS',
    },
    {view: 'VIEW1_DETAILS', state: 'SUBMIT', nextView: 'VIEW2_PURPOSE'},
    {view: 'VIEW2_PURPOSE', state: 'SUBMIT', nextView: 'VIEW3_PAYMENT'},
    {view: 'VIEW3_PAYMENT', state: 'SUBMIT', nextView: 'VIEW4_TYPE'},
    {view: 'VIEW4_TYPE', state: 'SUBMIT', nextView: 'VIEW5_MARITAL'},
    {view: 'VIEW5_MARITAL', state: 'SUBMIT', nextView: 'VIEW6_EMPLOYMENT'},
    {view: 'VIEW6_EMPLOYMENT', state: 'SUBMIT', nextView: 'VIEW7_TCUK_'},
    {view: 'VIEW7_TCUK_?', state: 'YES', nextView: 'VIEW8_TCUK_YES'},
    {view: 'VIEW7_TCUK_?', state: 'NO', nextView: 'VIEW9_TCUK_NO'},
    {view: 'VIEW8_TCUK_YES', state: 'YES', nextView: 'VIEW10_TCUK_YES_TC'},
    {view: 'VIEW8_TCUK_YES', state: 'NO', nextView: 'VIEW11_TCUK_YES_UK'},
    {view: 'VIEW10_TCUK_YES_TC', state: 'SUBMIT', nextView: 'VIEW12_COMPLETED'},
    {view: 'VIEW11_TCUK_YES_UK', state: 'SUBMIT', nextView: 'VIEW12_COMPLETED'},
    {view: 'VIEW9_TCUK_NO', state: 'SUBMIT', nextView: 'VIEW12_COMPLETED'},
    {view: 'VIEW12_COMPLETED', state: 'PASS', nextView: 'END'},
    {view: 'VIEW12_COMPLETED', state: 'FAIL', nextView: 'END'},
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
