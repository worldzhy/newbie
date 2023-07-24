import {ConfigService} from '@nestjs/config';
import {CustomLoggerService} from '../../src/toolkit/logger/logger.service';
import {PrismaService} from '../../src/toolkit/prisma/prisma.service';
import {SqsService} from '../../src/toolkit/aws/aws.sqs.service';

export async function seedForPmgmt() {
  const prisma = new PrismaService(
    new CustomLoggerService(
      new ConfigService(),
      new SqsService(new ConfigService())
    )
  );

  // Seed project management module.
  console.log('* Creating projects...');
  const projects = [{name: 'Galaxy'}, {name: 'InceptionPad'}];
  for (const project of projects) {
    await prisma.project.create({data: project});
  }
}
