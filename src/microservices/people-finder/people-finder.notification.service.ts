import {Logger, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class PeopleFinderNotificationService {
  private loggerContext = 'PeopleFinder-notification';
  webhookFeishu: string;
  accessKey: string;
  channelName: string;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private httpService: HttpService
  ) {
    this.webhookFeishu = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.notification.webhookFeishu'
    );
    this.accessKey = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.notification.accessKey'
    );
    this.channelName = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.notification.channelName'
    );
  }

  async send({message}: {message: string}) {
    return this.httpService.axiosRef
      .post<{batchId: string}, {status: number; data: string}>(
        this.webhookFeishu,
        {
          channelName: this.channelName,
          accessKey: this.accessKey,
          feishuParams: {
            content: {
              text: message,
            },
            msg_type: 'text',
          },
        }
      )
      .then(async res => {
        this.logger.log(
          'PeopleFinder notification catch: ' + JSON.stringify(res.data),
          this.loggerContext
        );
      })
      .catch(async e => {
        this.logger.error(
          'PeopleFinder notification catch: ' + JSON.stringify({error: e}),
          this.loggerContext
        );
      });
  }
}
