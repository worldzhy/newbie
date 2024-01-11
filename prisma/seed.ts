/* eslint-disable node/no-unpublished-import */
import {seedForDemo} from './seed/demo.seed';
import {seedForRecruitment} from './seed/recruitment.seed';
import {seedForSolidcore} from './seed/solidcore.seed';

async function main() {
  console.log('**Seeding Start');

  // await seedForDemo();
  // await seedForRecruitment();
  await seedForSolidcore();

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
