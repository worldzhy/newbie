import {PrismaClient} from '@generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

async function main() {
  console.info('** seeding start');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.PRISMA_DATABASE_URL as string,
    }),
  });

  // Seed like this:
  // ...
  // await prisma.user.create({data:{name:'admin'}})
  // ...

  console.info('** seeding end');
}

//

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
