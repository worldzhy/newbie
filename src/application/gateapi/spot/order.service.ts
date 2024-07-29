import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomNumbers} from '@toolkit/utilities/common.util';
import {
  Order_Type,
  Order_Side,
  Order_TimeInForce,
  Order_Filter,
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

  async list(params: {currencyPair: string; status: Order_Filter}) {
    const result = await this.spot.listOrders(
      params.currencyPair,
      params.status
    );
    return result.body;
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
    const client = new GateApi.ApiClient();
    client.setApiKeySecret(
      process.env.GATE_API_KEY,
      process.env.GATE_API_SECRET
    );

    const spot = new GateApi.SpotApi(client);

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
        const prisma = new PrismaClient();
        await prisma.spotOrder.create({data: result.body});
      }
    } catch (error) {
      if (error.response) console.warn(error.response.data);
    }
  }

  /* End */
}
