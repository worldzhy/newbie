import {registerAs} from '@nestjs/config';

export default registerAs('microservice', () => ({
  account: {
    security: {
      ipLoginLimiter: {
        // Each IP has a maximum of 10 attempts per 3600 seconds
        points: 10,
        durationSeconds: 3600,
      },
      userLoginLimiter: {
        // Each user has a maximum of 5 attempts per 3600 seconds
        points: 5,
        durationSeconds: 3600,
      },
    },
    verificationCode: {
      timeoutMinutes: 10, // The verification code will be invalid after 10 minutes.
      resendMinutes: 1, // The verification code can be resend after 1 minute.
    },
  },
  eventScheduling: {minutesOfTimeslotUnit: 5},
  'file-mgmt': {
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
  'project-mgmt': {
    pulumi: {
      awsVersion: process.env.PULUMI_AWS_VERSION,
      accessToken: process.env.PULUMI_ACCESS_TOKEN,
    },
  },
  task: {
    awsSqsQueueUrl: process.env.TASK_AWS_SQS_QUEUE_URL || 'default',
  },
  token: {
    access: {
      expiresIn: '6000s',
      secret: process.env.ACCESS_TOKEN_SECRET,
    },
    refresh: {
      expiresIn: '86400s',
      secret: process.env.REFRESH_TOKEN_SECRET,
    },
  },
}));
