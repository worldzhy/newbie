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
        type: Order_Type.Market, // limit or market
        account: 'spot',
        side: Order_Side.Buy, // buy or sell
        amount: params.amount, // trade amount
        timeInForce: Order_TimeInForce.ImmediateOrCancelled, // ImmediateOrCancelled
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
        type: Order_Type.Market, // limit or market
        account: 'spot',
        side: Order_Side.Sell, // buy or sell
        amount: params.amount, // trade amount
        timeInForce: Order_TimeInForce.ImmediateOrCancelled, // ImmediateOrCancelled
      });

      if (result.body) {
        await this.prisma.spotOrder.create({data: result.body});
      }
    } catch (error) {
      console.warn(error.response.data);
    }
  }

  static async callback_buy(params: {currencyPair: string; amount: string}) {
    // Set timeout to buy only in the first second.
    let loopFlag = true;
    setTimeout(() => {
      loopFlag = false;
    }, 1000);

    const client = new GateApi.ApiClient();
    client.setApiKeySecret(
      process.env.GATE_API_KEY,
      process.env.GATE_API_SECRET
    );
    const spot = new GateApi.SpotApi(client);

    while (loopFlag) {
      try {
        const result = await spot.createOrder({
          text: 't-' + generateRandomNumbers(8),
          currencyPair: params.currencyPair,
          type: Order_Type.Market, // limit or market
          account: 'spot',
          side: Order_Side.Buy, // buy or sell
          amount: params.amount, // trade amount
          timeInForce: Order_TimeInForce.ImmediateOrCancelled, // ImmediateOrCancelled
        });

        if (result.body) {
          // Start

          // Save order record.
          const prisma = new PrismaClient();
          await prisma.spotOrder.create({data: result.body});
        }

        loopFlag = false;
      } catch (error) {
        if (error.response) console.warn(error.response.data);
      }

      await delay(50);
    }
  }

  static async callback_sell(params: {currencyPair: string}) {
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

        if (result.body) {
          const ticker = result.body[0];
          console.log('----------');
          console.log(result.body);
          const lastPrice = parseFloat(ticker.last);

          if (lastPrice > highPrice) {
            highPrice = lastPrice;
            console.log('This highest price is ' + highPrice);
          } else if (lastPrice < highPrice * 0.8) {
            // Get the amount of the currency in account.
            const currencyBalance = await spot.listSpotAccounts({
              currency: params.currencyPair.split('_')[0],
            });
            const amount = currencyBalance.body[0].available;

            console.log(
              'The amount of ' +
                params.currencyPair.split('_')[0] +
                ' is ' +
                amount
            );

            // Sell the currency.
            const result = await spot.createOrder({
              text: 't-' + generateRandomNumbers(8),
              currencyPair: params.currencyPair,
              type: Order_Type.Market, // limit or market
              account: 'spot',
              side: Order_Side.Sell, // buy or sell
              amount: amount, // trade amount
              timeInForce: Order_TimeInForce.ImmediateOrCancelled, // ImmediateOrCancelled
            });

            if (result.body) {
              // Save order record.
              const prisma = new PrismaClient();
              await prisma.spotOrder.create({data: result.body});
            }

            loopFlag = false;
          } else {
            // Do nothing.
          }
        }
      } catch (error) {
        if (error.response) console.warn(error.response.data);
      }

      await delay(1000);
    }
  }

  /* End */
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
