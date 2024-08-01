import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
const GateApi = require('gate-api');

@Injectable()
export class SpotCurrencyService {
  private spotApi;

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

    this.spotApi = new GateApi.SpotApi(client);
  }

  async listSpotAccounts() {
    try {
      const result = await this.spotApi.listSpotAccounts();
      return result.body;
    } catch (error) {
      console.log(error);
    }
  }

  async getCurrency(currency: string) {
    try {
      const result = await this.spotApi.getCurrency(currency);
      if (result.body) {
        return result.body;
      } else {
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCurrencyPairs() {
    try {
      const result = await this.spotApi.listCurrencyPairs();
      if (result.body) {
        return result.body;
      } else {
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getCurrencyPair(currencyPair: string) {
    try {
      const result = await this.spotApi.getCurrencyPair(currencyPair);
      if (result.body) {
        return result.body;
      } else {
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async refreshCurrencyPairs() {
    // [step 1] Some currency pairs' buyStart may change.
    const currencyPairs = await this.prisma.spotCurrencyPair.findMany({
      where: {buyStart: {gt: Date.now() / 1000}},
      orderBy: {buyStart: 'asc'},
    });

    for (let i = 0; i < currencyPairs.length; i++) {
      const currencyPair = currencyPairs[i];

      const pair = await this.getCurrencyPair(currencyPair.id);
      if (pair) {
        try {
          await this.prisma.spotCurrencyPair.update({
            where: {id: currencyPair.id},
            data: pair,
          });
        } catch (error) {
          console.log(error);
        }
      }
    }

    // [step 2] Get all the currencies.
    const allCurrencyPairs = await this.getAllCurrencyPairs();
    if (allCurrencyPairs) {
      try {
        await this.prisma.spotCurrencyPair.createMany({
          data: allCurrencyPairs,
          skipDuplicates: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getLatestCurrencyPair() {
    return await this.prisma.spotCurrencyPair.findFirst({
      where: {buyStart: {gt: Date.now() / 1000}},
      orderBy: {buyStart: 'asc'},
    });
  }

  /* End */
}
