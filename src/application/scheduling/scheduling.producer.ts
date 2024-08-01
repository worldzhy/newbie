import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {SpotAccountService} from '../gateapi/spot/account.service';
import {SpotCurrencyService} from '../gateapi/spot/currency.service';
import {SpotOrderService} from '../gateapi/spot/order.service';

import {
  LARK_CHANNEL_NAME,
  MIN_USDT_AMOUNT_IN_WALLET,
} from '../application.constants';
import {dateOfUnixTimestamp} from '@toolkit/utilities/datetime.util';
import {LarkWebhookService} from '@microservices/notification/webhook/lark/lark.service';
import {TimeoutTaskService} from '@microservices/task-scheduling/timeout/timeout.service';

@Injectable()
export class CronJobProducer {
  constructor(
    private readonly spotAccountService: SpotAccountService,
    private readonly spotCurrencyService: SpotCurrencyService,
    private readonly timeoutTaskService: TimeoutTaskService,
    private readonly lark: LarkWebhookService
  ) {}

  @Cron('0 5,15,25,35,45,55 * * * *')
  async createTradeTask() {
    // [step 1] Fetch currency pairs from remote.
    await this.spotCurrencyService.refreshCurrencyPairs();

    // [step 2] Get the latest currency pairs from database.
    const latestCurrencyPair =
      await this.spotCurrencyService.getLatestCurrencyPair();
    if (!latestCurrencyPair) {
      return;
    }

    // [step 3] Create trade tasks for new currency pair.
    if (latestCurrencyPair.buyStart * 1000 - Date.now() <= 1000 * 60 * 5) {
      const buyTaskName = latestCurrencyPair.id + '_BUY';
      const sellTaskName = latestCurrencyPair.id + '_SELL';

      // create buy task
      const buyTask = this.timeoutTaskService.getTask(buyTaskName);
      if (buyTask) {
        this.timeoutTaskService.deleteTask(buyTaskName);
      }
      this.timeoutTaskService.createTask({
        name: buyTaskName,
        milliseconds: latestCurrencyPair.buyStart * 1000 - Date.now(),
        callback: async function () {
          await SpotOrderService.callback_buy({
            currencyPair: latestCurrencyPair.id,
          });
        },
      });

      // create sell task
      const sellTask = this.timeoutTaskService.getTask(sellTaskName);
      if (sellTask) {
        this.timeoutTaskService.deleteTask(sellTaskName);
      }
      this.timeoutTaskService.createTask({
        name: sellTaskName,
        milliseconds: latestCurrencyPair.buyStart * 1000 - Date.now(),
        callback: async function () {
          await SpotOrderService.callback_sell({
            currencyPair: latestCurrencyPair.id,
          });
        },
      });

      // send notification
      await this.lark.sendText({
        channelName: LARK_CHANNEL_NAME,
        text:
          '[新币播报]\n交易对：' +
          latestCurrencyPair.id +
          '\t' +
          '开盘时间：' +
          dateOfUnixTimestamp(latestCurrencyPair.buyStart).toLocaleString(
            'zh-CN',
            {timeZone: 'Asia/Shanghai'}
          ),
      });

      // send alert
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
    } else {
      return;
    }
  }
}
