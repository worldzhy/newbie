import {ConfigService} from '@nestjs/config';
import {CustomLoggerService} from '../../src/microservices/logger/logger.service';
import {PrismaService} from '../../src/toolkit/prisma/prisma.service';

export async function seedForWorkflow() {
  const prisma = new PrismaService(
    new CustomLoggerService(new ConfigService())
  );

  // Seed workflow data.
  console.log('* Creating workflow routes...');

  const workflow = await prisma.workflow.create({
    data: {name: 'A Good Workflow'},
  });

  const views = [
    {workflowId: workflow.id, name: 'START'},
    {workflowId: workflow.id, name: 'DETAILS'},
    {workflowId: workflow.id, name: 'PURPOSE'},
    {workflowId: workflow.id, name: 'TYPE'},
    {workflowId: workflow.id, name: 'MARITAL'},
    {workflowId: workflow.id, name: 'EMPLOYMENT'},
    {workflowId: workflow.id, name: 'CITIZEN_TCUK_OR_OTHERS'},
    {workflowId: workflow.id, name: 'CITIZEN_TCUK'},
    {workflowId: workflow.id, name: 'CITIZEN_OTHERS'},
    {workflowId: workflow.id, name: 'CITIZEN_TC'},
    {workflowId: workflow.id, name: 'CITIZEN_UK'},
    {workflowId: workflow.id, name: 'PAYMENT'},
    {workflowId: workflow.id, name: 'COMPLETED'},
    {workflowId: workflow.id, name: 'END'},
  ];
  for (let i = 0; i < views.length; i++) {
    await prisma.workflowView.createMany({data: views[i]});
  }

  const states = [
    {workflowId: workflow.id, name: 'CONTINUE'},
    {workflowId: workflow.id, name: 'SUBMIT'},
    {workflowId: workflow.id, name: 'YES'},
    {workflowId: workflow.id, name: 'NO'},
    {workflowId: workflow.id, name: 'PAYMENT_SUCCEEDED'},
    {workflowId: workflow.id, name: 'PAYMENT_FAILED'},
    {workflowId: workflow.id, name: 'PASS'},
    {workflowId: workflow.id, name: 'FAIL'},
  ];
  for (let i = 0; i < states.length; i++) {
    await prisma.workflowState.create({data: states[i]});
  }

  const routes = [
    {
      workflowId: workflow.id,
      startSign: true,
      viewId: 1,
      stateId: 1,
      nextViewId: 2,
    },
    {
      workflowId: workflow.id,
      viewId: 2,
      stateId: 2,
      nextViewId: 3,
    },
    {
      workflowId: workflow.id,
      viewId: 3,
      stateId: 2,
      nextViewId: 4,
    },
    {
      workflowId: workflow.id,
      viewId: 4,
      stateId: 2,
      nextViewId: 5,
    },
    {
      workflowId: workflow.id,
      viewId: 5,
      stateId: 2,
      nextViewId: 6,
    },
    {
      workflowId: workflow.id,
      viewId: 6,
      stateId: 2,
      nextViewId: 7,
    },
    {
      workflowId: workflow.id,
      viewId: 7,
      stateId: 3,
      nextViewId: 8,
    },
    {
      workflowId: workflow.id,
      viewId: 7,
      stateId: 4,
      nextViewId: 9,
    },
    {
      workflowId: workflow.id,
      viewId: 8,
      stateId: 3,
      nextViewId: 10,
    },
    {
      workflowId: workflow.id,
      viewId: 8,
      stateId: 4,
      nextViewId: 11,
    },
    {
      workflowId: workflow.id,
      viewId: 10,
      stateId: 2,
      nextViewId: 12,
    },
    {
      workflowId: workflow.id,
      viewId: 11,
      stateId: 2,
      nextViewId: 12,
    },
    {
      workflowId: workflow.id,
      viewId: 9,
      stateId: 2,
      nextViewId: 12,
    },
    {
      workflowId: workflow.id,
      viewId: 12,
      stateId: 5,
      nextViewId: 13,
    },
    {
      workflowId: workflow.id,
      viewId: 12,
      stateId: 6,
      nextViewId: 12,
    },
    {
      workflowId: workflow.id,
      viewId: 13,
      stateId: 7,
      nextViewId: 14,
    },
    {
      workflowId: workflow.id,
      viewId: 13,
      stateId: 8,
      nextViewId: 14,
    },
  ];
  for (let i = 0; i < routes.length; i++) {
    await prisma.workflowRoute.createMany({data: routes[i]});
  }
}
