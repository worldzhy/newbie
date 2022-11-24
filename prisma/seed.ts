import {
  ElasticsearchDatasource,
  PermissionAction,
  PostgresqlDatasource,
  Prisma,
  TrustedEntityType,
} from '@prisma/client';
import {AccountController} from '../src/applications/account/account.controller';
import {OrganizationController} from '../src/applications/account/user/organization/organization.controller';
import {RoleController} from '../src/applications/account/user/role/role.controller';
import {PermissionController} from '../src/applications/account/authorization/permission/permission.controller';
import {ProjectController} from '../src/applications/pmgmt/project/project.controller';
import {ElasticsearchDatasourceController} from '../src/applications/engined/datasource/elasticsearch/elasticsearch-datasource.controller';
import {PostgresqlDatasourceController} from '../src/applications/engined/datasource/postgresql/postgresql-datasource.controller';
import {DatatransPipelineController} from '../src/applications/engined/datatrans/pipeline/pipeline.controller';
import {WorkflowController} from '../src/applications/workflow/workflow.controller';
import {WorkflowStepController} from '../src/applications/workflow/step/step.controller';
import {WorkflowStateController} from '../src/applications/workflow/state/state.controller';

async function main() {
  console.log('Start seeding ...');

  // Seed workflow data.
  console.log('* Creating workflows...');

  const workflowController = new WorkflowController();
  const workflowStepController = new WorkflowStepController();
  const workflowStateController = new WorkflowStateController();

  const steps = [
    {step: 'START'},
    {step: 'STEP1_DISPATCH'},
    {step: 'STEP2_TEST'},
    {step: 'STEP3_REVIEW'},
    {step: 'END'},
  ];
  for (let i = 0; i < steps.length; i++) {
    await workflowStepController.createWorkflowStep(steps[i]);
  }

  const states = [
    {state: 'Pending Dispatch'}, // [Recruiter] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Pending Test'}, // [Referral Coordinator] assign to [Provider] to work on STEP2_TEST screen
    {state: 'Medical Hold'}, // [Provider] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {state: 'CV Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {state: 'Lab Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {state: 'Late'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled - Medical Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled - CV hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled - Lab Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Reviewer Hold'}, // [Secondary Reviewer] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {state: 'Resubmission'}, // [Secondary Reviewer] assign to [Provider] to work on STEP2_TEST screen
    // Final states below.
    {state: 'Pass'}, // [Provider] finish the process
    {state: 'Discontinue'}, // [Provider] finish the process
    {state: 'Terminated'}, // [Provider] finish the process
    {state: 'MD-CLR'}, // [Secondary Reviewer] finish the process
    {state: 'MD-CLR-P-CV'}, // [Secondary Reviewer] finish the process
    {state: 'MD-CLR-WL'}, // [Secondary Reviewer] finish the process
    {state: 'MD-NOT-CLR'}, // [Secondary Reviewer] finish the process
    {state: 'MD-DISC'}, // [Secondary Reviewer] finish the process
    {state: 'D-Failed'}, // [Secondary Reviewer] finish the process
  ];
  for (let i = 0; i < states.length; i++) {
    await workflowStateController.createWorkflowState(states[i]);
  }

  const workflowForfinalStates = [
    {step: 'STEP2_TEST', state: 'Pass', nextStep: 'END'},
    {step: 'STEP2_TEST', state: 'Discontinue', nextStep: 'END'},
    {step: 'STEP2_TEST', state: 'Terminated', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR-P-CV', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR-WL', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-NOT-CLR', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-DISC', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'D-Failed', nextStep: 'END'},
  ];
  for (let i = 0; i < workflowForfinalStates.length; i++) {
    await workflowController.createWorkflow(workflowForfinalStates[i]);
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
    // Create an user with Admin role.
    if (role.name === RoleName.Admin) {
      await authController.signup({
        username: 'admin',
        password: 'Abc1234!',
        userToRoles: {create: [{roleId: role.id}]},
      });
    }

    // Add all resource permissions to roles.
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

    // Add condition permissions to roles.
    if (role.name === RoleName.Recruiter) {
      // nothing to process.
    } else if (role.name === RoleName.Dispatcher) {
      // [step 1] Create workflows.
      const workflows = [
        {
          step: 'START',
          state: 'Pending Dispatch',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },

        {
          step: 'STEP2_TEST',
          state: 'CV Hold',
          nextStep: 'STEP2_TEST',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Lab Hold',
          nextStep: 'STEP2_TEST',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Late',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Cancelled',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Cancelled - Medical Hold',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Cancelled - CV hold',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
        {
          step: 'STEP2_TEST',
          state: 'Cancelled - Lab Hold',
          nextStep: 'STEP1_DISPATCH',
          nextRoleId: role.id, // [Referral Coordinator]
        },
      ];
      for (let i = 0; i < workflows.length; i++) {
        await workflowController.createWorkflow(workflows[i]);
      }

      // [step 2] Create permissions.
      await permissionController.createPermission({
        action: PermissionAction.read,
        resource: Prisma.ModelName.JobApplication,
        where: {
          testings: {
            some: {
              state: {
                in: [
                  'Pending Dispatch',
                  'CV Hold',
                  'Lab Hold',
                  'Late',
                  'Cancelled',
                  'Cancelled - Medical Hold',
                  'Cancelled - CV hold',
                  'Cancelled - Lab Hold',
                ],
              },
            },
          },
        },
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      });
    } else if (role.name === RoleName.Provider) {
      // [step 1] Create workflows.
      const workflows = [
        {
          step: 'STEP1_DISPATCH',
          state: 'Pending Test',
          nextStep: 'STEP2_TEST',
          nextRoleId: role.id, // [Provider]
        },
        {
          step: 'STEP3_REVIEW',
          state: 'Resubmission',
          nextStep: 'STEP2_TEST',
          nextRoleId: role.id, // [Provider]
        },
      ];
      for (let i = 0; i < workflows.length; i++) {
        await workflowController.createWorkflow(workflows[i]);
      }

      // [step 2] Create permissions.
      await permissionController.createPermission({
        action: PermissionAction.read,
        resource: Prisma.ModelName.JobApplication,
        where: {
          testings: {
            some: {
              state: {
                in: ['Pending Test', 'Resubmission'],
              },
            },
          },
        },
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      });
    } else if (role.name === RoleName.Reviewer) {
      // [step 1] Create workflows.
      const workflows = [
        {
          step: 'STEP2_TEST',
          state: 'Medical Hold',
          nextStep: 'STEP3_REVIEW',
          nextRoleId: role.id, // [Secondary Reviewer]
        },
        {
          step: 'STEP3_REVIEW',
          state: 'Reviewer Hold',
          nextStep: 'STEP3_REVIEW',
          nextRoleId: role.id, // [Secondary Reviewer]
        },
      ];
      for (let i = 0; i < workflows.length; i++) {
        await workflowController.createWorkflow(workflows[i]);
      }

      // [step 2] Create permissions.
      await permissionController.createPermission({
        action: PermissionAction.read,
        resource: Prisma.ModelName.JobApplication,
        where: {
          testings: {
            some: {
              state: {
                in: ['Medical Hold', 'Reviewer Hold'],
              },
            },
          },
        },
        trustedEntityType: TrustedEntityType.ROLE,
        trustedEntityId: role.id,
      });
    }
  }

  // Seed project management module.
  console.log('* Creating projects...');
  const projectController = new ProjectController();
  const projects = [
    {
      name: 'Galaxy',
      clientName: 'Jim Green',
      clientEmail: 'jim@galaxy.com',
    },
    {name: 'InceptionPad'},
  ];
  for (const project of projects) {
    await projectController.createProject(project);
  }

  // Seed datasource module.
  console.log('* Creating postgresql and elasticsearch datasources...');
  const postgresqlDatasourceController = new PostgresqlDatasourceController();
  const elasticsearchDatasourceController =
    new ElasticsearchDatasourceController();
  let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  datasource = await postgresqlDatasourceController.createPostgresqlDatasource({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    schema: 'application/account',
  });
  await postgresqlDatasourceController.loadPostgresqlDatasource(datasource.id);

  datasource =
    await elasticsearchDatasourceController.createElasticsearchDatasource({
      node: '127.0.0.1',
    });
  await elasticsearchDatasourceController.loadElasticsearchDatasource(
    datasource.id
  );

  // Seed datatrans module.
  console.log('* Creating datatrans pipeline...');
  const pipelineController = new DatatransPipelineController();
  await pipelineController.createPipeline({
    name: 'pg2es_pipeline',
    hasManyTables: [],
    belongsToTables: [],
    fromTableId: 1,
    toIndexId: 1,
  });

  // Seeding Finished.
  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
