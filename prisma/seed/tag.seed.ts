import {PrismaClient} from '@prisma/client';

export async function seedForTag() {
  const prisma = new PrismaClient();

  console.log('\n* Tag Service');

  console.log('- Creating tag groups...');
  await prisma.tagGroup.createMany({
    data: [{name: 'Coach'}, {name: 'Location'}],
  });

  console.log('- Creating tags...');
  await prisma.tag.createMany({
    data: [
      {
        name: 'experienced',
        groupId: 1,
      },
      {
        name: 'patient',
        groupId: 1,
      },
      {
        name: 'near-college',
        groupId: 2,
      },
      {
        name: 'near-business-center',
        groupId: 2,
      },
    ],
  });
}
