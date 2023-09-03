import {EventContainerStatus, PrismaClient} from '@prisma/client';
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

  console.log('- Creating event locations...');
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
    ],
  });

  console.log('- Creating event container...');
  await prisma.eventContainer.create({
    data: {
      name: 'Henry English Class Room',
      status: EventContainerStatus.ACTIVE,
      dateOfOpening: '2023-08-10',
      dateOfClosure: '2023-08-12',
      timezone: 'Europe/Athens',
    },
  });
}
