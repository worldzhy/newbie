import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
const GateApi = require('gate-api');

@Injectable()
export class DepositService {
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
    const response = await this.wallet.getDepositAddress(currency);
    if (response.body) {
      return response.body;
    } else {
      return response;
    }
  }

  /* End */
}
