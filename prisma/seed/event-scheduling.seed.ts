import {PrismaClient} from '@prisma/client';

export async function seedForEventScheduling() {
  const prisma = new PrismaClient();

  console.log('\n* Event Calendar Service');

  console.log('- Creating event types...');
  await prisma.eventType.createMany({
    data: [
      {
        name: 'Full Body',
        minutesOfDuration: 50,
      },
      {
        name: 'Buns + Guns',
        minutesOfDuration: 50,
      },
      {
        name: 'Arms + Abs',
        minutesOfDuration: 50,
      },
      {
        name: 'Buns + Abs',
        minutesOfDuration: 50,
      },
      {
        name: 'Foundations',
        minutesOfDuration: 50,
      },
      {
        name: 'Beginner50',
        minutesOfDuration: 50,
      },
      {
        name: '30min Express: Core + Lower Body',
        minutesOfDuration: 30,
      },
      {
        name: '30min Express: Core + Obliques',
        minutesOfDuration: 30,
      },
      {
        name: '30min Express: Core + Upper Body',
        minutesOfDuration: 30,
      },
      {
        name: 'coach-in-training',
        minutesOfDuration: 50,
      },
      {
        name: 'Advanced Supersolid 65min',
        minutesOfDuration: 65,
      },
      {
        name: 'Advanced Full Body',
        minutesOfDuration: 65,
      },
    ],
  });
}
