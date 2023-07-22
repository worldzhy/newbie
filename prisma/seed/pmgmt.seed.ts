import {ConfigService} from '@nestjs/config';
import {CustomLoggerService} from '../../src/microservices/logger/logger.service';
import {PrismaService} from '../../src/toolkit/prisma/prisma.service';

export async function seedForPmgmt() {
  const prisma = new PrismaService(
    new CustomLoggerService(new ConfigService())
  );

  // Seed project management module.
  console.log('* Creating projects...');
  const projects = [{name: 'Galaxy'}, {name: 'InceptionPad'}];
  for (const project of projects) {
    await prisma.project.create({data: project});
  }
}
