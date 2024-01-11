import {PrismaClient} from '@prisma/client';

export async function seedForDemo() {
  const prisma = new PrismaClient();

  console.log('\n* Project Management Service');
  console.log('- Creating project...');
  const projects = [{name: 'Galaxy'}, {name: 'InceptionPad'}];
  for (const project of projects) {
    await prisma.project.create({data: project});
  }

  console.log('\n* Workflow Service');

  console.log('- Creating workflow...');
  const workflow = await prisma.workflow.create({
    data: {name: 'A Good Workflow'},
  });

  console.log('- Creating workflow views...');
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

  console.log('- Creating workflow states...');
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

  console.log('- Creating workflow routes...');
  const routes = [
    {
      startSign: true,
      viewId: 1,
      stateId: 1,
      nextViewId: 2,
    },
    {viewId: 2, stateId: 2, nextViewId: 3},
    {viewId: 3, stateId: 2, nextViewId: 4},
    {viewId: 4, stateId: 2, nextViewId: 5},
    {viewId: 5, stateId: 2, nextViewId: 6},
    {viewId: 6, stateId: 2, nextViewId: 7},
    {viewId: 7, stateId: 3, nextViewId: 8},
    {viewId: 7, stateId: 4, nextViewId: 9},
    {viewId: 8, stateId: 3, nextViewId: 10},
    {viewId: 8, stateId: 4, nextViewId: 11},
    {viewId: 10, stateId: 2, nextViewId: 12},
    {viewId: 11, stateId: 2, nextViewId: 12},
    {viewId: 9, stateId: 2, nextViewId: 12},
    {viewId: 12, stateId: 5, nextViewId: 13},
    {viewId: 12, stateId: 6, nextViewId: 12},
    {viewId: 13, stateId: 7, nextViewId: 14},
    {viewId: 13, stateId: 8, nextViewId: 14},
  ];
  for (let i = 0; i < routes.length; i++) {
    await prisma.workflowRoute.createMany({data: routes[i]});
  }

  // Seed datasource module.
  // console.log('* Creating postgresql and elasticsearch datasources...');
  // const postgresqlDatasourceController = new PostgresqlDatasourceController();
  // const elasticsearchDatasourceController =
  //   new ElasticsearchDatasourceController();
  // let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  // datasource = await postgresqlDatasourceController.createPostgresqlDatasource({
  //   host: '127.0.0.1',
  //   port: 5432,
  //   database: 'postgres',
  //   schema: 'application/account',
  // });
  // await postgresqlDatasourceController.loadPostgresqlDatasource(datasource.id);
  // datasource =
  //   await elasticsearchDatasourceController.createElasticsearchDatasource({
  //     node: 'http://127.0.0.1',
  //   });
  // await elasticsearchDatasourceController.loadElasticsearchDatasource(
  //   datasource.id
  // );
  // // Seed datatrans module.
  // console.log('* Creating datatrans pipeline...');
  // const pipelineController = new DatatransPipelineController();
  // await pipelineController.createPipeline({
  //   name: 'pg2es_pipeline',
  //   hasManyTables: [],
  //   belongsToTables: [],
  //   fromTableId: 1,
  //   toIndexId: 1,
  // });
}
