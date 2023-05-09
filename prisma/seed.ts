import {seedForEngined} from './seed/engined.seed';
import {seedForPmgmt} from './seed/pmgmt.seed';
import {seedForRecruitment} from './seed/recruitment.seed';
import {seedForTcRequest} from './seed/tc-request.seed';

async function main() {
  console.log('Start seeding ...');

  // await seedForEngined();
  // await seedForPmgmt();
  // await seedForRecruitment();
  await seedForTcRequest();

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
