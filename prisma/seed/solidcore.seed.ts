import {PrismaClient} from '@prisma/client';

export async function seedForSolidcore() {
  const prisma = new PrismaClient();

  console.log('\n* Event Calendar Service');

  console.log('\n* Tag Service');

  console.log('- Creating tag groups...');
  await prisma.tagGroup.createMany({
    data: [{name: 'Coach'}, {name: 'Location'}, {name: 'Installment'}],
  });

  console.log('- Creating tags...');
  await prisma.tag.createMany({
    data: [
      {
        name: 'TBD',
        groupId: 1,
      },
      {
        name: 'Installment A',
        groupId: 3,
      },
      {
        name: 'Installment B',
        groupId: 3,
      },
      {
        name: 'Installment C',
        groupId: 3,
      },
    ],
  });

  console.log('- Creating event types...');
  await prisma.eventType.createMany({
    data: [
      {
        name: 'Full Body',
        minutesOfDuration: 50,
        tagId: 2,
      },
      {
        name: 'Buns + Guns',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Arms + Abs',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Buns + Abs',
        minutesOfDuration: 50,
        tagId: 4,
      },
      {
        name: 'Foundations',
        minutesOfDuration: 50,
        tagId: 3,
      },
      {
        name: 'Beginner50',
        minutesOfDuration: 50,
        tagId: 3,
      },
      {
        name: '30min Express: Core + Lower Body',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: '30min Express: Core + Obliques',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: '30min Express: Core + Upper Body',
        minutesOfDuration: 30,
        tagId: 4,
      },
      {
        name: 'coach-in-training',
        minutesOfDuration: 50,
        tagId: 2,
      },
      {
        name: 'Advanced Supersolid 65min',
        minutesOfDuration: 65,
        tagId: 4,
      },
      {
        name: 'Advanced Full Body',
        minutesOfDuration: 65,
        tagId: 4,
      },
      {
        name: "Advanced SuperSolid - Solidcore's 10th Anniversary Class!",
        minutesOfDuration: 65,
        tagId: 4,
      },
    ],
  });
}
