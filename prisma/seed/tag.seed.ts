import {PrismaClient} from '@prisma/client';

export async function seedForTag() {
  const prisma = new PrismaClient();

  console.log('\n* Tag Service');

  console.log('- Creating tags...');
  await prisma.tag.createMany({
    data: [
      {
        name: 'experienced',
        group: 'Coach',
      },
      {
        name: 'patient',
        group: 'Coach',
      },
      {
        name: 'near-college',
        group: 'Location',
      },
      {
        name: 'near-business-center',
        group: 'Location',
      },
    ],
  });
}
