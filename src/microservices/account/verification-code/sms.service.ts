import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SendMessagesCommandOutput} from '@aws-sdk/client-pinpoint';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AwsPinpointService} from './aws.pinpoint.service';

@Injectable()
export class VerificationCodeSmsService {
  private smsPinpointApplicationId: string;
  private smsPinpointSenderId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly pinpointService: AwsPinpointService
  ) {
    this.smsPinpointApplicationId = this.configService.getOrThrow<string>(
      'microservice.account.aws.pinpointApplicationId'
    )!;
    this.smsPinpointSenderId = this.configService.getOrThrow<string>(
      'microservice.account.aws.pinpointSenderId'
    )!;
  }

  async send(params: {phone: string; text: string}) {
    // [step 1] Send AWS Pinpoint message.
    const output: SendMessagesCommandOutput =
      await this.pinpointService.sendSms({
        applicationId: this.smsPinpointApplicationId,
        senderId: this.smsPinpointSenderId,
        body: params,
      });

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[params.phone].MessageId;
      }
    }

    return await this.prisma.verificationCodeSms.create({
      data: {
        payload: params,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
      },
    });
  }
}
