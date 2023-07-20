import {ProjectController} from '../../src/application/pmgmt/project/project.controller';

export async function seedForPmgmt() {
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
}
