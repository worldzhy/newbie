import {EventContainerStatus, PrismaClient} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';

export async function seedForEventCalendar() {
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

  console.log('- Creating spaces...');
  await prisma.eventContainer.create({
    data: {
      name: 'Henry English Class Room',
      status: EventContainerStatus.ACTIVE,
      dateOfOpening: '2023-08-10',
      dateOfClosure: '2023-08-12',
      timezone: 'Europe/Athens',
    },
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
