import {Injectable} from '@nestjs/common';
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import {Config} from '../../_common/_common.config';

@Injectable()
export class SnsService {
  private client: SNSClient;

  constructor() {
    this.client = new SNSClient({
      region: Config.getRegion(),
    });
  }

  /**
   * Publish notification
   *
   * @param {{PhoneNumber: string; Message: string}} params
   * @returns
   * @memberof SnsService
   */
  async publish(params: {PhoneNumber: string; Message: string}) {
    const {PhoneNumber, Message} = params;
    return await this.client.send(
      new PublishCommand({
        PhoneNumber,
        Message,
      })
    );
  }
}
