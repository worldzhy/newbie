import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
const GateApi = require('gate-api');

@Injectable()
export class WalletService {
  private wallet;

  constructor(private readonly config: ConfigService) {
    const client = new GateApi.ApiClient();

    // Configure Gate APIv4 key authentication:
    client.setApiKeySecret(
      this.config.getOrThrow<string>('application.gateApi.key'),
      this.config.getOrThrow<string>('application.gateApi.secret')
    );

    this.wallet = new GateApi.WalletApi(client);
  }

  async getDepositAddress(currency: string) {
    try {
      const result = await this.wallet.getDepositAddress(currency);
      return result.body;
    } catch (error) {}
  }

  async getTotalBalance() {
    try {
      const result = await this.wallet.getTotalBalance();
      return result.body;
    } catch (error) {}
  }

  /* End */
}
