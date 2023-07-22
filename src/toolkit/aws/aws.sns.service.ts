import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';

@Injectable()
export class SnsService {
  private client: SNSClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SNSClient({
      region: this.configService.get<string>('toolkit.aws.sns.region'),
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
