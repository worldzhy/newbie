import {Injectable} from '@nestjs/common';
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import {AwsConfig} from '../../_config/_aws.config';

@Injectable()
export class SnsService {
  private client: SNSClient;

  constructor() {
    this.client = new SNSClient({
      region: AwsConfig.getRegion(),
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
