import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomNumbers} from '@toolkit/utilities/common.util';
import {
  Order_Type,
  Order_Side,
  Order_TimeInForce,
} from '../../application.constants';
import {PrismaClient} from '@prisma/client';
const GateApi = require('gate-api');

@Injectable()
export class SpotOrderService {
  private spot;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const client = new GateApi.ApiClient();
    client.setApiKeySecret(
      this.config.getOrThrow<string>('application.gateApi.key'),
      this.config.getOrThrow<string>('application.gateApi.secret')
    );

    this.spot = new GateApi.SpotApi(client);
  }

  /**
   * example currency pair: TAI_USDT(TAI is base, USDT is quote)
   *
   * amount:
   * When type is limit, it refers to base currency.
   * When type is market, it refers to different currency according to side
   *      buy:  amount means quote currency
   *      sell: amount means base currency
   */
  async buy(params: {currencyPair: string; amount: string}): Promise<void> {
    try {
      const result = await this.spot.createOrder({
        text: 't-' + generateRandomNumbers(8),
        currencyPair: params.currencyPair,
        type: Order_Type.Market,
        account: 'spot',
        side: Order_Side.Buy,
        amount: params.amount,
        timeInForce: Order_TimeInForce.ImmediateOrCancelled,
      });

      if (result.body) {
        await this.prisma.spotOrder.create({data: result.body});
      }
    } catch (error) {
      console.warn(error.response.data);
    }
  }

  /**
   * example currency pair: TAI_USDT(TAI is base, USDT is quote)
   *
   * amount:
   * When type is limit, it refers to base currency.
   * When type is market, it refers to different currency according to side
   *      buy:  amount means quote currency
   *      sell: amount means base currency
   */
  async sell(params: {currencyPair: string; amount: string}) {
    try {
      const result = await this.spot.createOrder({
        text: 't-' + generateRandomNumbers(8),
        currencyPair: params.currencyPair,
        type: Order_Type.Market,
        account: 'spot',
        side: Order_Side.Sell,
        amount: params.amount,
        timeInForce: Order_TimeInForce.ImmediateOrCancelled,
      });

      if (result.body) {
        await this.prisma.spotOrder.create({data: result.body});
      }
    } catch (error) {
      console.warn(error.response.data);
    }
  }

  static async callback_buy(params: {currencyPair: string; amount: number}) {
    console.info(
      `[${params.currencyPair}_BUY] We are snapping up the currency.`
    );

    let loopFlag = true;

    // Set timeout to buy only in the first 5 seconds.
    // setTimeout(() => {
    //   loopFlag = false;
    // }, 5000);

    const client = new GateApi.ApiClient();
    client.setApiKeySecret(
      process.env.GATE_API_KEY,
      process.env.GATE_API_SECRET
    );
    const spot = new GateApi.SpotApi(client);

    while (loopFlag) {
      console.info(
        `[${
          params.currencyPair
        }_BUY] We are trying to buy the currency. The time is ${Date.now()}.`
      );

      try {
        const result = await spot.createOrder({
          text: 't-' + generateRandomNumbers(8),
          currencyPair: params.currencyPair,
          type: Order_Type.Market,
          account: 'spot',
          side: Order_Side.Buy,
          amount: params.amount,
          timeInForce: Order_TimeInForce.ImmediateOrCancelled,
        });

        if (result.body) {
          // Save order record.
          const prisma = new PrismaClient();
          await prisma.spotOrder.create({data: result.body});
        }

        loopFlag = false;
      } catch (error) {
        if (error.response) {
          console.warn(
            `[${params.currencyPair}_BUY] Something wrong happened when we were trying to buy.`
          );
          console.warn(error.response.data);
        }
      }

      // await delay(50);
    }

    console.info(
      `[${params.currencyPair}_BUY] We have completed the buy transaction.`
    );
  }

  static async callback_sell(params: {currencyPair: string}) {
    console.info(
      `[${params.currencyPair}_SELL] We are waiting for the right price to sell the currency.`
    );

    let loopFlag = true;
    let highPrice = 0;

    const client = new GateApi.ApiClient();
    client.setApiKeySecret(
      process.env.GATE_API_KEY,
      process.env.GATE_API_SECRET
    );
    const spot = new GateApi.SpotApi(client);

    while (loopFlag) {
      try {
        const result = await spot.listTickers({
          currencyPair: params.currencyPair,
        });
        if (!result.body) {
          continue;
        }

        const lastPrice = parseFloat(result.body[0].last);
        if (lastPrice > highPrice) {
          highPrice = lastPrice;
          console.info(
            `[${params.currencyPair}_SELL] Now the highest price is ${highPrice}`
          );
        } else if (lastPrice < highPrice * 0.8) {
          console.info(
            `[${
              params.currencyPair
            }_SELL] We are trying to sell the currency. The time is ${Date.now()}`
          );

          // Get the amount of the currency in account.
          const currencyBalance = await spot.listSpotAccounts({
            currency: params.currencyPair.split('_')[0],
          });
          const amount = currencyBalance.body[0].available;

          // Sell the currency.
          const result = await spot.createOrder({
            text: 't-' + generateRandomNumbers(8),
            currencyPair: params.currencyPair,
            type: Order_Type.Market,
            account: 'spot',
            side: Order_Side.Sell,
            amount: amount,
            timeInForce: Order_TimeInForce.ImmediateOrCancelled,
          });

          if (result.body) {
            loopFlag = false;

            // Save order record.
            const prisma = new PrismaClient();
            await prisma.spotOrder.create({data: result.body});
          }
        } else {
          // Do nothing.
        }
      } catch (error) {
        if (error.response) {
          console.warn(
            `[${params.currencyPair}_SELL] Something wrong happened when We were trying to sell.`
          );
          console.warn(error.response.data);
        }
      }

      await delay(10);
    }

    console.info(
      `[${params.currencyPair}_SELL] We have completed the sell transaction.`
    );
  }

  /* End */
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
