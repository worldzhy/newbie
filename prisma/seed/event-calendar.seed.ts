import {AvailabilityContainerStatus, PrismaClient} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';

export async function seedForEventCalendar() {
  const prisma = new PrismaClient();
  prisma.$use(prismaMiddleware);

  console.log('\n* Event Calendar Service');

  console.log('- Creating events...');
  await prisma.event.createMany({
    data: [
      {
        name: 'Adult English Class',
        minutesOfDuration: 30,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
        numberOfSeats: 1,
      },
      {
        name: 'Teenager English Class',
        minutesOfDuration: 30,
        minutesInAdvanceToReserve: 120,
        minutesInAdvanceToCancel: 120,
        numberOfSeats: 1,
      },
    ],
  });

  console.log('- Creating availability container...');
  await prisma.availabilityContainer.create({
    data: {
      name: 'Henry English Class Room',
      status: AvailabilityContainerStatus.ACTIVE,
      dateOfOpening: '2023-08-10',
      dateOfClosure: '2023-08-12',
      timezone: 'Europe/Athens',
    },
  });
}
