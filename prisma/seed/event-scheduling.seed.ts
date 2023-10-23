import {PrismaClient} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';

export async function seedForEventScheduling() {
  const prisma = new PrismaClient();
  prisma.$use(prismaMiddleware);

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

  console.log('- Creating event venues...');
  await prisma.eventVenue.createMany({
    data: [
      {
        name: 'CA, Culver City',
        numberOfSeats: 20,
        minutesOfBreak: 10,
        placeId: 1,
        external_studioId: 5723396,
        external_studioName: '[solidcore] California',
        external_locationId: 1,
      },
      {
        name: 'CA, Hollywood',
        numberOfSeats: 20,
        minutesOfBreak: 10,
        placeId: 2,
        external_studioId: 5723396,
        external_studioName: '[solidcore] California',
        external_locationId: 2,
      },
      {
        name: 'CA, West Hollywood',
        numberOfSeats: 20,
        minutesOfBreak: 10,
        placeId: 3,
        external_studioId: 5723396,
        external_studioName: '[solidcore] California',
        external_locationId: 3,
      },
      {
        name: 'CA, Santa Monica',
        numberOfSeats: 20,
        minutesOfBreak: 10,
        placeId: 4,
        external_studioId: 5723396,
        external_studioName: '[solidcore] California',
        external_locationId: 4,
      },
    ],
  });

  console.log('- Creating event container...');
  await prisma.eventContainer.createMany({
    data: [
      {
        year: 2023,
        month: 9,
        timezone: 'Europe/Athens',
        venueId: 1,
      },
      {
        year: 2023,
        month: 10,
        timezone: 'Europe/Athens',
        venueId: 1,
      },
      {
        year: 2023,
        month: 9,
        timezone: 'Europe/Athens',
        venueId: 2,
      },
      {
        year: 2023,
        month: 10,
        timezone: 'Europe/Athens',
        venueId: 2,
      },
      {
        year: 2023,
        month: 9,
        timezone: 'Europe/Athens',
        venueId: 3,
      },
      {
        year: 2023,
        month: 10,
        timezone: 'Europe/Athens',
        venueId: 3,
      },
      {
        year: 2023,
        month: 9,
        timezone: 'Europe/Athens',
        venueId: 4,
      },
      {
        year: 2023,
        month: 10,
        timezone: 'Europe/Athens',
        venueId: 4,
      },
    ],
  });
}
