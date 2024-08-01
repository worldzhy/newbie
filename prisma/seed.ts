import {PrismaClient} from '@prisma/client';
import {LARK_CHANNEL_NAME} from '../src/application/application.constants';

async function main() {
  console.log('**Seeding Start');

  const prisma = new PrismaClient();

  await prisma.notificationWebhookChannel.create({
    data: {
      name: LARK_CHANNEL_NAME,
      platform: 'lark',
      webhook:
        'https://open.feishu.cn/open-apis/bot/v2/hook/95a55b4b-2547-446a-b3e3-09e5c7d1db88',
    },
  });

  console.log('\n**Seeding End');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
