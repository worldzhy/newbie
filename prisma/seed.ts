import {seedForEngined} from './seed/engined.seed';
import {seedForPmgmt} from './seed/pmgmt.seed';
import {seedForAccount} from './seed/account.seed';
import {seedForWorkflow} from './seed/workflow.seed';

async function main() {
  console.log('Start seeding ...');
  
  await seedForAccount();
  await seedForWorkflow();
  await seedForEngined();
  await seedForPmgmt();

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
