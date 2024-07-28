import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {SpotCurrencyService} from '../gateapi/spot/currency.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {SpotAccountService} from '../gateapi/spot/account.service';
import {
  LARK_CHANNEL_NAME,
  MIN_USDT_AMOUNT_IN_WALLET,
} from '../application.constants';
import {LarkWebhookService} from '@microservices/notification/webhook/lark/lark.service';
import {dateOfUnixTimestamp} from '@toolkit/utilities/datetime.util';

@Injectable()
export class CronJobProducer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotAccountService: SpotAccountService,
    private readonly spotCurrencyService: SpotCurrencyService,
    private readonly lark: LarkWebhookService
  ) {}

  @Cron('0 0 * * * *')
  async fetchNewCurrencyPairs() {
    console.log('Fetch new currency pairs at ' + Date());

    // [step 1] Fetch currency pairs from remote.
    await this.spotCurrencyService.getAllCurrencyPairs();

    // [step 2] Get new currency pairs from database.
    const newCurrencyPairs =
      await this.spotCurrencyService.getNewCurrencyPairs();

    const larkText = newCurrencyPairs
      .map(
        pair =>
          '交易对：' +
          pair.id +
          (pair.id.length < 8 ? '\t\t' : '\t') +
          '开盘时间：' +
          dateOfUnixTimestamp(pair.buyStart).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
          })
      )
      .toString()
      .replaceAll(',', '\n');
    await this.lark.sendText({
      channelName: LARK_CHANNEL_NAME,
      text: '[新币来了]\n' + larkText,
    });

    // [step 3] Check spot account if there are enough
    const usdtBalance = await this.spotAccountService.getBalance('USDT');
    if (usdtBalance < MIN_USDT_AMOUNT_IN_WALLET) {
      await this.lark.sendText({
        channelName: LARK_CHANNEL_NAME,
        text:
          '[温馨提示]\n当前现货账户的 USDT 数量为：' +
          usdtBalance +
          '，请及时充值。',
      });
    }

    // [step 3] Create trade tasks for new currency pairs.
    // for (let i = 0; i < newCurrencyPairs.length; i++) {
    //   const newCurrencyPair = newCurrencyPairs[i];

    //   const count = await this.prisma.tradeTask.count({
    //     where: {base: newCurrencyPair.base, quote: newCurrencyPair.quote},
    //   });
    //   if (count < 1) {
    //     await this.prisma.tradeTask.create({
    //       data: {
    //         base: newCurrencyPair.base,
    //         quote: newCurrencyPair.quote,
    //         quoteAmount: parseFloat(newCurrencyPair.minQuoteAmount ?? '1.0'), // Buy 1.0 if there is no min quote amount.
    //         buyStart: newCurrencyPair.buyStart,
    //       },
    //     });

    //     await this.prisma.cronTask.create({
    //       data: {
    //         name: '',
    //         cronTime: '',
    //       },
    //     });
    //   }
    // }
  }
}
