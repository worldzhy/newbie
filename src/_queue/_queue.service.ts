import {PrismaService} from '../_prisma/_prisma.service';
import {SqsService} from '../_aws/_sqs/_sqs.service';
import {CommonConfig} from '../_config/_common.config';
import {AwsEnum} from '../_config/_common.enum';

export class QueueService {
  private sqs = new SqsService();
  private prisma = new PrismaService();
  private context = 'QueueService';
  private emailQueueUrl = CommonConfig.getSqsEmailQueueUrl();
  private smsQueueUrl = CommonConfig.getSqsSmsQueueUrl();
  private pinpointSmsSenderId = CommonConfig.getPinpointSmsSenderId();

  async sendEmail(
    subject: string,
    content: string,
    toAddress: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Push email message to email queue.
    const result = await this.sqs.sendMessage(this.emailQueueUrl, {
      subject,
      content,
      toAddress,
    });

    // [step 2] Save source SQS message to database.
    if (result.data) {
      const dbResult = await this.prisma.sqsMessage.create({
        data: {
          messageId: result.data.MessageId,
          queueUrl: this.emailQueueUrl,
          context: this.context,
          message: {subject, content, toAddress},
          responseData: result.data as object,
        },
      });
      if (dbResult) {
        return {
          data: {
            message: 'Send email to queue successfully.',
          },
          err: null,
        };
      } else {
        return {
          data: {
            message:
              'Send email to queue successfully, but save message to database failed.',
          },
          err: null,
        };
      }
    } else {
      const dbResult = await this.prisma.sqsMessage.create({
        data: {
          // No MessageId for failed call.
          queueUrl: this.emailQueueUrl,
          context: this.context,
          message: {subject, content, toAddress},
          responseErr: result.err as object,
        },
      });
      if (dbResult) {
        return {
          data: null,
          err: {
            data: null,
            err: {
              message: 'Send SMS to queue failed.',
            },
          },
        };
      } else {
        return {
          data: null,
          err: {
            message:
              'Send email to queue failed, then save message to database failed.',
          },
        };
      }
    }
  }

  async sendSms(content: string, phone: string) {
    // [step 1] Push SMS message to SMS queue.
    const result = await this.sqs.sendMessage(this.smsQueueUrl, {
      phone,
      content,
      messageType: AwsEnum.pinpointSmsMessageType.TRANSACTIONAL,
      senderId: this.pinpointSmsSenderId,
    });

    // [step 2] Save source SQS message to database.
    if (result.data) {
      const dbResult = await this.prisma.sqsMessage.create({
        data: {
          messageId: result.data.MessageId,
          queueUrl: this.smsQueueUrl,
          context: this.context,
          message: {
            phone,
            content,
            messageType: AwsEnum.pinpointSmsMessageType.TRANSACTIONAL,
            senderId: this.pinpointSmsSenderId,
          },
          responseData: result.data as object,
        },
      });
      if (dbResult) {
        return {
          data: {message: 'Send SMS to queue successfully.'},
          err: null,
        };
      } else {
        return {
          data: {
            message:
              'Send SMS to queue successfully, but save message to database failed.',
          },
          err: null,
        };
      }
    } else {
      // Call SQS failed
      const dbResult = await this.prisma.sqsMessage.create({
        data: {
          // No MessageId for failed call.
          queueUrl: this.smsQueueUrl,
          context: this.context,
          message: {
            phone,
            content,
            messageType: AwsEnum.pinpointSmsMessageType.TRANSACTIONAL,
            senderId: this.pinpointSmsSenderId,
          },
          responseErr: result.err as object,
        },
      });
      if (dbResult) {
        return {
          data: null,
          err: {message: 'Send SMS to queue failed.'},
        };
      } else {
        return {
          data: null,
          err: {
            message:
              'Send SMS to queue failed, then save message to database failed.',
          },
        };
      }
    }
  }
}
