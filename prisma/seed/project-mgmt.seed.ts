import {PrismaClient} from '@prisma/client';

export async function seedForPmgmt() {
  const prisma = new PrismaClient();

  console.log('\n* Project Management Service');
  console.log('- Creating project...');
  const projects = [{name: 'Galaxy'}, {name: 'InceptionPad'}];
  for (const project of projects) {
    await prisma.project.create({data: project});
  }
}
