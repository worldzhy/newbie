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
        name: 'Adult English Class',
        minutesOfDuration: 30,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
      },
      {
        name: 'Teenager English Class',
        minutesOfDuration: 30,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
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
