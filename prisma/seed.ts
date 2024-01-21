/* eslint-disable node/no-unpublished-import */
import {seedForAircruiser} from './seed/aircruiser.seed';
import {seedForRecruitment} from './seed/recruitment.seed';
import {seedForSolidcore} from './seed/solidcore.seed';

async function main() {
  console.log('**Seeding Start');

  await seedForAircruiser();
  // await seedForRecruitment();
  // await seedForSolidcore();

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
