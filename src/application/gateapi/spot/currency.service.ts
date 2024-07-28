import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
const GateApi = require('gate-api');

@Injectable()
export class SpotCurrencyService {
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

  async listSpotAccounts() {
    const result = await this.spot.listSpotAccounts();
    return result.body;
  }

  async getAllCurrencies() {
    const result = await this.spot.listCurrencies();
    if (result.body) {
      await this.prisma.currency.createMany({
        data: result.body,
        skipDuplicates: true,
      });
    } else {
      return result;
    }
  }

  async getCurrency(currency: string) {
    const result = await this.spot.getCurrency(currency);
    if (result.body) {
      return result.body;
    } else {
      return result;
    }
  }

  async getAllCurrencyPairs() {
    const result = await this.spot.listCurrencyPairs();
    if (result.body) {
      await this.prisma.currencyPair.createMany({
        data: result.body,
        skipDuplicates: true,
      });
    } else {
      return result;
    }
  }

  async getCurrencyPair() {
    const result = await this.spot.getCurrencyPair();
    if (result.body) {
      return result.body;
    } else {
      return result;
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

  /* End */
}
