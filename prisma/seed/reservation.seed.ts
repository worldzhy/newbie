import {PrismaClient} from '@prisma/client';

export async function seedForReservation() {
  const prisma = new PrismaClient();

  console.log('\n* Reservation Service');

  console.log('- Creating availability providers...');
  await prisma.availabilityProvider.createMany({
    data: [
      {
        providedContent: 'Adult English Class',
        canReserveBeforeMinutes: 120,
        canCancelBeforeMinutes: 120,
        numberOfSeats: 1,
      },
      {
        providedContent: 'Teenager English Class',
        canReserveBeforeMinutes: 120,
        canCancelBeforeMinutes: 120,
        numberOfSeats: 1,
      },
    ],
  });

  console.log('- Creating availability room...');
  await prisma.availabilityRoom.create({
    data: {name: 'Henry English Class Room'},
  });
}
