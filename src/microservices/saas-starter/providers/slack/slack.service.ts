import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  ChatPostMessageArguments,
  WebAPICallResult,
  WebClient,
} from '@slack/web-api';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

@Injectable()
export class SlackService {
  client: WebClient;
  private logger = new Logger(SlackService.name);
  private queue = new PQueue({concurrency: 1});

  constructor(private configService: ConfigService) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.slack'
    );
    if (config.token)
      this.client = new WebClient(config.token, {
        slackApiUrl: config.slackApiUrl,
        rejectRateLimitedCalls: config.rejectRateLimitedCalls,
      });
  }

  send(options: ChatPostMessageArguments) {
    this.queue
      .add(() =>
        pRetry(() => this.sendMessage(options), {
          retries: this.configService.get<number>('slack.retries') ?? 3,
          onFailedAttempt: error => {
            this.logger.error(
              `Message to ${options.channel} failed, retrying (${error.retriesLeft} attempts left)`,
              error.name
            );
          },
        })
      )
      .then(() => {})
      .catch(() => {});
  }

  sendToChannel(channelName: string, text: string) {
    this.queue
      .add(() =>
        pRetry(() => this.sendMessageToChannel(channelName, text), {
          retries: this.configService.get<number>('slack.retries') ?? 3,
          onFailedAttempt: error => {
            this.logger.error(
              `Message to ${channelName} failed, retrying (${error.retriesLeft} attempts left)`,
              error.name
            );
          },
        })
      )
      .then(() => {})
      .catch(() => {});
  }

  private async sendMessageToChannel(channelName: string, text: string) {
    const conversations =
      (await this.client.conversations.list()) as WebAPICallResult & {
        channels: {name: string; id: string}[];
      };
    const channel = conversations.channels.find(
      channel => channel.name === channelName
    );
    if (channel) {
      const options: ChatPostMessageArguments = {text, channel: channel.id};
      return this.client.chat.postMessage(options);
    } else {
      throw new NotFoundException('Your channel does not exist.');
    }
  }
  private async sendMessage(options: ChatPostMessageArguments) {
    return this.client.chat.postMessage(options);
  }
}
