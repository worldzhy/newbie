import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomNumbers} from '@toolkit/utilities/common.util';
const GateApi = require('gate-api');

@Injectable()
export class CurrencyService {
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

  async getAllCurrencies() {
    const response = await this.spot.listCurrencies();
    if (response.body) {
      await this.prisma.currency.createMany({
        data: response.body,
        skipDuplicates: true,
      });
    } else {
      return response;
    }
  }

  async getCurrency(currency: string) {
    const response = await this.spot.getCurrency(currency);
    if (response.body) {
      return response.body;
    } else {
      return response;
    }
  }

  async getAllCurrencyPairs() {
    const response = await this.spot.listCurrencyPairs();
    if (response.body) {
      await this.prisma.currencyPair.createMany({
        data: response.body,
        skipDuplicates: true,
      });
    } else {
      return response;
    }
  }

  async getCurrencyPair() {
    const response = await this.spot.getCurrencyPair();
    if (response.body) {
      return response.body;
    } else {
      return response;
    }
  }

  async getNewCurrencyPairs() {
    const currencyPairs = await this.prisma.currencyPair.findMany({
      where: {
        buyStart: {gt: new Date().getTime() / 1000},
      },
      orderBy: {buyStart: 'asc'},
    });
    return currencyPairs;
  }

  async getCurrencyTickers(currencyPair: string) {
    const currencyTickers = await this.spot.listTickers({
      currency_pair: currencyPair,
    });
    console.log(currencyTickers);
  }

  async createOrder() {
    const result = await this.spot.createOrder({
      text: 't-' + generateRandomNumbers(8),
      currency_pair: '',
      type: Order_Type.Market, // limit or market
      account: 'spot',
      side: Order_Side.Buy, // buy or sell
      amount: '', // trade amount
      time_in_force: Order_TimeInForce.ImmediateOrCancelled, // ImmediateOrCancelled
    });
  }

  /* End */
}
