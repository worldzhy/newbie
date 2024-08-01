import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

const GateApi = require('gate-api');

@Injectable()
export class GateAccountService {
  private account;

  constructor(private readonly config: ConfigService) {
    const client = new GateApi.ApiClient();

    // Configure Gate APIv4 key authentication:
    client.setApiKeySecret(
      this.config.getOrThrow<string>('application.gateApi.key'),
      this.config.getOrThrow<string>('application.gateApi.secret')
    );

    this.account = new GateApi.AccountApi(client);
  }

  async getDetail() {
    const result = await this.account.getAccountDetail();

    return result.body;
  }

  /* End */
}
