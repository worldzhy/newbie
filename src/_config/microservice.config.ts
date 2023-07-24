import {registerAs} from '@nestjs/config';

export default registerAs('microservice', () => ({
  fmgmt: {
    awsS3Bucket: process.env.FILE_MANAGEMENT_AWS_S3_BUCKET,
    awsCloudfrontDomain: process.env.FILE_MANAGEMENT_AWS_CLOUDFRONT_DOMAIN,
    localPath: process.env.FILE_MANAGEMENT_LOCAL_PATH || './uploaded-files',
  },
  notification: {
    email: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointFromAddress:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_FROM_ADDRESS || 'default',
    },
    sms: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointSenderId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_SENDER_ID || 'default',
    },
  },
  task: {
    awsSqsQueueUrl: process.env.TASK_AWS_SQS_QUEUE_URL || 'default',
  },
  verificationCode: {
    timeoutMinutes: process.env.VERIFICATION_CODE_TIMEOUT_MINUTES,
    resendMinutes: process.env.VERIFICATION_CODE_RESEND_MINUTES,
  },
}));
