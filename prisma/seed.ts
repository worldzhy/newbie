import {PrismaClient} from '@prisma/client';

async function main() {
  console.info('** seeding start');

  const prisma = new PrismaClient();

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
