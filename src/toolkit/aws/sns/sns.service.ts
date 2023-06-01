import {Injectable} from '@nestjs/common';
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import {getAwsSnsConfig} from './sns.config';

@Injectable()
export class SnsService {
  private client: SNSClient;

  constructor() {
    this.client = new SNSClient({
      region: getAwsSnsConfig().region,
    });
  }

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
