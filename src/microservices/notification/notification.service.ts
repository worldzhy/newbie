import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SendMessagesCommandOutput} from '@aws-sdk/client-pinpoint';
import {EmailNotification, SmsNotification} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';
import {PinpointService} from '../../toolkit/aws/aws.pinpoint.service';

@Injectable()
export class NotificationService {
  private emailPinpointApplicationId: string;
  private emailPinpointFromAddress: string;

  private smsPinpointApplicationId: string;
  private smsPinpointSenderId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly pinpointService: PinpointService
  ) {
    this.emailPinpointApplicationId = this.configService.getOrThrow<string>(
      'microservice.notification.email.awsPinpointApplicationId'
    )!;
    this.emailPinpointFromAddress = this.configService.getOrThrow<string>(
      'microservice.notification.email.awsPinpointFromAddress'
    )!;
    this.smsPinpointApplicationId = this.configService.getOrThrow<string>(
      'microservice.notification.sms.awsPinpointApplicationId'
    )!;
    this.smsPinpointSenderId = this.configService.getOrThrow<string>(
      'microservice.notification.sms.awsPinpointSenderId'
    )!;
  }

  async sendEmail(params: {
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

  async sendSms(params: {
    phone: string;
    text: string;
  }): Promise<SmsNotification> {
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

    return await this.prisma.smsNotification.create({
      data: {
        payload: params,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
      },
    });
  }
}
