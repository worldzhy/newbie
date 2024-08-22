import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SendMessagesCommandOutput} from '@aws-sdk/client-pinpoint';
import {EmailNotification} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {AwsPinpointService} from './aws.pinpoint.service';

@Injectable()
export class EmailService {
  private emailPinpointApplicationId: string;
  private emailPinpointFromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly pinpointService: AwsPinpointService
  ) {
    this.emailPinpointApplicationId = this.configService.getOrThrow<string>(
      'microservices.notification.email.awsPinpointApplicationId'
    )!;
    this.emailPinpointFromAddress = this.configService.getOrThrow<string>(
      'microservices.notification.email.awsPinpointFromAddress'
    )!;
  }

  async send(params: {
    email: string;
    subject: string;
    plainText?: string;
    html?: string;
  }): Promise<EmailNotification> {
    // [step 1] Send AWS Pinpoint message.
    const output: SendMessagesCommandOutput =
      await this.pinpointService.sendEmail({
        applicationId: this.emailPinpointApplicationId,
        fromAddress: this.emailPinpointFromAddress,
        body: params,
      });

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[params.email].MessageId;
      }
    }

    return await this.prisma.emailNotification.create({
      data: {
        payload: params,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
      },
    });
  }
}
