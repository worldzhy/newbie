import {PrismaClient} from '@prisma/client';

export async function seedForPmgmt() {
  const prisma = new PrismaClient();

  // Seed project management module.
  console.log('* Creating projects...');
  const projects = [{name: 'Galaxy'}, {name: 'InceptionPad'}];
  for (const project of projects) {
    await prisma.project.create({data: project});
  }
}
