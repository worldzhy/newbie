import {Injectable} from '@nestjs/common';
import {Cron, Timeout} from '@nestjs/schedule';
import {SpotAccountService} from '../gateapi/spot/account.service';
import {SpotCurrencyService} from '../gateapi/spot/currency.service';
import {SpotOrderService} from '../gateapi/spot/order.service';

import {
  LARK_CHANNEL_NAME,
  MIN_USDT_AMOUNT_IN_WALLET,
} from '../application.constants';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {dateOfUnixTimestamp} from '@toolkit/utilities/datetime.util';
import {LarkWebhookService} from '@microservices/notification/webhook/lark/lark.service';
import {TimeoutTaskService} from '@microservices/task-scheduling/timeout/timeout.service';

@Injectable()
export class CronJobProducer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotAccountService: SpotAccountService,
    private readonly spotCurrencyService: SpotCurrencyService,
    private readonly timeoutTaskService: TimeoutTaskService,
    private readonly lark: LarkWebhookService
  ) {}

  // @Timeout(10000)
  // handleTradeTask() {
  //   const currencyPair = 'MOXIE_USDT';
  //   const buyTaskName = currencyPair + '_BUY';
  //   const sellTaskName = currencyPair + '_SELL';

  //   // Create buy task
  //   const buyTask = this.timeoutTaskService.getTask(buyTaskName);
  //   if (!buyTask) {
  //     this.timeoutTaskService.createTask({
  //       name: buyTaskName,
  //       milliseconds: 5000, // delay 50ms
  //       callback: async function () {
  //         await SpotOrderService.callback_buy({
  //           currencyPair: currencyPair,
  //           amount: '5',
  //         });
  //       },
  //     });
  //   }

  //   // Create sell task
  //   const sellTask = this.timeoutTaskService.getTask(sellTaskName);
  //   if (!sellTask) {
  //     this.timeoutTaskService.createTask({
  //       name: sellTaskName,
  //       milliseconds: 5000,
  //       callback: async function () {
  //         await SpotOrderService.callback_sell({
  //           currencyPair: currencyPair,
  //         });
  //       },
  //     });
  //   }
  // }

  @Cron('0 55 * * * *')
  async fetchNewCurrencyPairs() {
    console.log('Fetch new currency pairs at ' + Date());

    // [step 1] Fetch currency pairs from remote.
    await this.spotCurrencyService.getAllCurrencyPairs();

    // [step 2] Get new currency pairs from database.
    const newCurrencyPairs =
      await this.spotCurrencyService.getNewCurrencyPairs();

    await this.prisma.spotStock.createMany({
      data: newCurrencyPairs.map(pair => {
        return {currency: pair.base, amount: '0', highPrice: '0'};
      }),
      skipDuplicates: true,
    });

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
      text: '[新币播报]\n' + larkText,
    });

    // [step 3] Create trade tasks for new currency pairs.
    for (let i = 0; i < newCurrencyPairs.length; i++) {
      const newCurrencyPair = newCurrencyPairs[i];
      const buyTaskName = newCurrencyPair.id + '_BUY';
      const sellTaskName = newCurrencyPair.id + '_SELL';

      // Create buy task
      const buyTask = this.timeoutTaskService.getTask(buyTaskName);
      if (!buyTask) {
        this.timeoutTaskService.createTask({
          name: buyTaskName,
          milliseconds: newCurrencyPair.buyStart * 1000 - Date.now(),
          callback: async function () {
            await SpotOrderService.callback_buy({
              currencyPair: newCurrencyPair.id,
            });
          },
        });
      }

      // Create sell task
      const sellTask = this.timeoutTaskService.getTask(sellTaskName);
      if (!sellTask) {
        this.timeoutTaskService.createTask({
          name: sellTaskName,
          milliseconds: newCurrencyPair.buyStart * 1000 - Date.now(),
          callback: async function () {
            await SpotOrderService.callback_sell({
              currencyPair: newCurrencyPair.id,
            });
          },
        });
      }
    }

    // [step 4] Check spot account if there are enough
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
  }
}
