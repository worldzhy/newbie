import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
const GateApi = require('gate-api');

@Injectable()
export class SpotAccountService {
  private spotApi;

  constructor(private readonly config: ConfigService) {
    const client = new GateApi.ApiClient();

    // Configure Gate APIv4 key authentication:
    client.setApiKeySecret(
      this.config.getOrThrow<string>('application.gateApi.key'),
      this.config.getOrThrow<string>('application.gateApi.secret')
    );

    this.spotApi = new GateApi.SpotApi(client);
  }

  async listSpotAccounts() {
    const result = await this.spotApi.listSpotAccounts();
    return result.body;
  }

  async getBalance(currency: string) {
    const result = await this.spotApi.listSpotAccounts({currency});
    if (result.body) {
      return parseFloat(result.body[0].available);
    }

    return 0;
  }

  /* End */
}
