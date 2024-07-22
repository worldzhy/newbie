import {registerAs} from '@nestjs/config';

export default registerAs('microservice', () => ({
  account: {
    security: {
      ipLoginLimiter: {
        // Each IP has a maximum of 10 attempts per 600 seconds
        points: 10,
        durationSeconds: 600,
      },
      userLoginLimiter: {
        // Each user has a maximum of 5 attempts per 600 seconds
        points: 5,
        durationSeconds: 600,
      },
      ipAccessLimiter: {
        // Each user has a maximum of 100 attempts per 60 seconds
        points: 20,
        durationSeconds: 60,
      },
    },
    token: {
      userAccess: {
        expiresIn: '10m',
        secret: process.env.ACCOUNT_USER_ACCESS_TOKEN_SECRET,
      },
      userRefresh: {
        expiresIn: '1440m',
        secret: process.env.ACCOUNT_USER_REFRESH_TOKEN_SECRET,
      },
    },
    verificationCode: {
      timeoutMinutes: 1, // The verification code will be invalid after 1 minutes.
      resendMinutes: 1, // The verification code can be resend after 1 minute.
    },
    aws: {
      accessKeyId: 'process.env.ACCOUNT_AWS_ACCESS_KEY_ID',
      secretAccessKey: 'process.env.ACCOUNT_AWS_SECRET_ACCESS_KEY',
      region: 'process.env.ACCOUNT_AWS_REGION',
      pinpointApplicationId:
        "process.env.ACCOUNT_AWS_PINPOINT_APPLICATION_ID || 'default'",
      pinpointFromAddress:
        "process.env.ACCOUNT_AWS_PINPOINT_FROM_ADDRESS || 'default'",
      pinpointSenderId:
        "process.env.ACCOUNT_AWS_PINPOINT_SENDER_ID || 'default'",
    },
  },
  aws: {
    sqs: {
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY || 'default',
      region: process.env.AWS_SQS_REGION || 'default',
      queueUrl: process.env.AWS_SQS_QUEUE_URL,
    },
  },
  cloudformation: {
    token: {
      secret: process.env.AWS_CLOUDFORMATION_SECRETKEY_TOKEN_SECRET,
    },
  },
  eventScheduling: {minutesOfTimeslotUnit: 5},
  googleapis: {
    credentials: {
      apiKey: process.env.GOOGLE_CREDENTIALS_API_KEY,
      serviceAccount: process.env.GOOGLE_CREDENTIALS_SERVICE_ACCOUNT,
    },
  },
  mindbody: {
    mbUrl: process.env.MINDBODY_URL,
    username: process.env.MINDBODY_USER,
    password: process.env.MINDBODY_PWD,
    apiKey: process.env.MINDBODY_API_KEY,
    setFree: process.env.MINDBODY_FREE === 'TRUE',
    siteId: -99,
  },
  notification: {
    aws: {
      accessKeyId: process.env.NOTIFICATION_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NOTIFICATION_AWS_SECRET_ACCESS_KEY,
      region: process.env.NOTIFICATION_AWS_REGION,
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
        'https://sqs.us-east-1.amazonaws.com/196438055748/inceptionpad-message-service-email-queue-level1',
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
      accessKeyId: process.env.NOTIFICATION_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NOTIFICATION_AWS_SECRET_ACCESS_KEY,
      region: process.env.NOTIFICATION_AWS_REGION,
      s3Bucket: process.env.STORAGE_AWS_S3_BUCKET,
      cloudfrontDomain: process.env.STORAGE_AWS_CLOUDFRONT_DOMAIN,
    },
    local: {path: process.env.FILE_MANAGEMENT_LOCAL_PATH || './storage'},
  },
  peopleFinder: {
    voilanorbert: {
      apiKey: process.env.PEOPLE_FINDER_VOILANORBERT_API_KEY,
      callbackOrigin: process.env.PEOPLE_FINDER_VOILANORBERT_CALLBACK_ORIGIN,
    },
    proxycurl: {
      apiKey: process.env.PEOPLE_FINDER_PROXYCURL_API_KEY,
    },
    peopledatalabs: {
      apiKey: process.env.PEOPLE_FINDER_PEOPLEDATALABS_API_KEY,
    },
    notification: {
      webhookFeishu: process.env.PEOPLE_FINDER_WEBHOOK_FEISHU,
      accessKey: process.env.PEOPLE_FINDER_ACCESS_KEY,
      channelName: process.env.PEOPLE_FINDER_SYSTEM_CHANNEL,
    },
  },
}));
