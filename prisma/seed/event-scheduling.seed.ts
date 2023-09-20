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
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
      {
        name: 'Arms + Abs',
        minutesOfDuration: 50,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
      {
        name: 'Beginner50',
        minutesOfDuration: 50,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
      {
        name: 'Buns + Guns',
        minutesOfDuration: 50,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
      {
        name: 'Coach-in-Training',
        minutesOfDuration: 50,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
    ],
  });

  console.log('- Creating event venues...');
  await prisma.eventVenue.createMany({
    data: [
      {
        name: 'CA, Santa Monica',
        address: '2000 Main Street suite a',
        city: 'Santa Monica',
        numberOfSeats: 20,
        minutesOfBreak: 10,
      },
      {
        name: 'CA, Pasadena',
        address: '127 North Fair Oaks Avenue Suite 30',
        city: 'Pasadena',
        numberOfSeats: 20,
        minutesOfBreak: 10,
      },
      {
        name: 'NY, Center',
        address: '2000 Main Street suite a',
        city: 'New York City',
        numberOfSeats: 20,
        minutesOfBreak: 10,
      },
      {
        name: 'NY, North',
        address: '127 North Fair Oaks Avenue Suite 30',
        city: 'New York City',
        numberOfSeats: 20,
        minutesOfBreak: 10,
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

  console.log('- Creating events...');
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      await prisma.event.createMany({
        data: [
          {
            datetimeOfStart: '2023-09-01T06:00:00.000Z',
            datetimeOfEnd: '2023-09-01T06:50:00.000Z',
            year: 2023,
            month: 9,
            dayOfMonth: 1 + i,
            dayOfWeek: (5 + i) % 7,
            hour: 6 + j,
            minute: 0,
            minutesOfDuration: 50,
            containerId: 1,
            typeId: 1,
            venueId: 1,
          },
        ],
      });
    }
  }

  console.log('- Creating availability expression...');
  await prisma;
}
