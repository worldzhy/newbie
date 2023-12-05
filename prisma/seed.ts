/* eslint-disable node/no-unpublished-import */
import {seedForAccount} from './seed/account.seed';
import {seedForEngined} from './seed/engined.seed';
import {seedForPmgmt} from './seed/project-mgmt.seed';
import {seedForWorkflow} from './seed/workflow.seed';
import {seedForSolidcore} from './seed/solidcore.seed';

async function main() {
  console.log('**Seeding Start');

  await seedForAccount();
  await seedForSolidcore();
  // await seedForWorkflow();
  // await seedForEngined();
  // await seedForPmgmt();

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
