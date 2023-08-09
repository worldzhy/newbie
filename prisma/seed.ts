/* eslint-disable node/no-unpublished-import */
import {seedForEngined} from './seed/engined.seed';
import {seedForPmgmt} from './seed/pmgmt.seed';
import {seedForAccount} from './seed/account.seed';
import {seedForReservation} from './seed/event-calendar.seed';
import {seedForWorkflow} from './seed/workflow.seed';

async function main() {
  console.log('**Seeding Start');

  await seedForAccount();
  await seedForReservation();
  await seedForWorkflow();
  await seedForEngined();
  await seedForPmgmt();

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
