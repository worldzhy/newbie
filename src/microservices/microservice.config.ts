import {registerAs} from '@nestjs/config';

export default registerAs('microservice', () => ({
  account: {
    security: {
      ipLoginLimiter: {points: 10, durationSeconds: 600},
      userLoginLimiter: {points: 5, durationSeconds: 600},
      ipAccessLimiter: {points: 20, durationSeconds: 60},
    },
    token: {
      userAccess: {
        expiresIn: '10m',
        secret:
          process.env.ACCOUNT_USER_ACCESS_TOKEN_SECRET ||
          'your-access-token-secret',
      },
      userRefresh: {
        expiresIn: '1440m',
        secret:
          process.env.ACCOUNT_USER_REFRESH_TOKEN_SECRET ||
          'your-refresh-token-secret',
      },
    },
    verificationCode: {timeoutMinutes: 1, resendMinutes: 1},
    aws: {
      accessKeyId: process.env.ACCOUNT_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.ACCOUNT_AWS_SECRET_ACCESS_KEY,
      region: process.env.ACCOUNT_AWS_REGION || 'us-east-1',
      pinpointApplicationId:
        process.env.ACCOUNT_AWS_PINPOINT_APPLICATION_ID || 'default',
      pinpointFromAddress:
        process.env.ACCOUNT_AWS_PINPOINT_FROM_ADDRESS || 'default',
      pinpointSenderId: process.env.ACCOUNT_AWS_PINPOINT_SENDER_ID || 'default',
    },
  },
  aws: {
    sqs: {
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY,
      region: process.env.AWS_SQS_REGION || 'us-east-1',
      queueUrl: process.env.AWS_SQS_QUEUE_URL,
    },
  },
  cloudformation: {
    token: {
      secret:
        process.env.AWS_CLOUDFORMATION_SECRETKEY_TOKEN_SECRET ||
        'your-secretkey-token-secret',
    },
  },
  eventScheduling: {minutesOfTimeslotUnit: 5},
  googleapis: {
    credentials: {
      apiKey: process.env.GOOGLE_CREDENTIALS_API_KEY,
      serviceAccount: process.env.GOOGLE_CREDENTIALS_SERVICE_ACCOUNT,
    },
  },
  notification: {
    aws: {
      accessKeyId: process.env.NOTIFICATION_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NOTIFICATION_AWS_SECRET_ACCESS_KEY,
      region: process.env.NOTIFICATION_AWS_REGION || 'us-east-1',
    },
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
    traceableEmail: {
      awsSqsQueueUrl:
        'https://sqs.us-east-1.amazonaws.com/196438055748/traceable-email-service-email-queue-level1',
    },
  },
  peopleFinder: {
    voilanorbert: {
      apiKey: process.env.PEOPLE_FINDER_VOILANORBERT_API_KEY,
      callbackOrigin: process.env.PEOPLE_FINDER_VOILANORBERT_CALLBACK_ORIGIN,
    },
    proxycurl: {apiKey: process.env.PEOPLE_FINDER_PROXYCURL_API_KEY},
    peopledatalabs: {apiKey: process.env.PEOPLE_FINDER_PEOPLEDATALABS_API_KEY},
    notification: {
      webhookFeishu: process.env.PEOPLE_FINDER_WEBHOOK_FEISHU,
      accessKey: process.env.PEOPLE_FINDER_ACCESS_KEY,
      channelName: process.env.PEOPLE_FINDER_SYSTEM_CHANNEL,
    },
  },
  storage: {
    googleapis: {
      credentials: {
        apiKey: process.env.STORAGE_GOOGLE_CREDENTIALS_API_KEY,
        serviceAccount: process.env.STORAGE_GOOGLE_CREDENTIALS_SERVICE_ACCOUNT,
      },
    },
    aws: {
      accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_AWS_SECRET_ACCESS_KEY,
      region: process.env.STORAGE_AWS_REGION || 'us-east-1',
      s3Bucket: process.env.STORAGE_AWS_S3_BUCKET,
      cloudfrontDomain: process.env.STORAGE_AWS_CLOUDFRONT_DOMAIN,
    },
    local: {path: process.env.STORAGE_LOCAL_PATH},
  },
}));
