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
const GateApi = require('gate-api');

@Injectable()
export class SpotOrderService {
  private spot;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const client = new GateApi.ApiClient();

    // Configure Gate APIv4 key authentication:
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
  async buy(params: {currencyPair: string; amount: number}) {
    // Calculate amount
    const cp = await this.prisma.currencyPair.findUniqueOrThrow({
      where: {id: params.currencyPair},
    });

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
      return await this.prisma.order.create({data: result.body});
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
  async sell(params: {currencyPair: string; amount: number}) {
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
      return await this.prisma.order.create({data: result.body});
    }
  }

  /* End */
}
