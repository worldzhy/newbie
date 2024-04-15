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
    verificationCode: {
      timeoutMinutes: 10, // The verification code will be invalid after 10 minutes.
      resendMinutes: 1, // The verification code can be resend after 1 minute.
    },
  },
  aws: {
    accountId: process.env.AWS_ACCOUNT_ID,
    profile: process.env.AWS_PROFILE,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3ForCloudformation: process.env.AWS_S3_FOR_CLOUDFORMATION,
    pinpoint: {
      accessKeyId: process.env.AWS_PINPOINT_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_PINPOINT_SECRET_ACCESS_KEY || 'default',
      region: process.env.AWS_PINPOINT_REGION || 'default',
    },
    s3: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || 'default',
      region: process.env.AWS_S3_REGION || 'default',
    },
    sqs: {
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY || 'default',
      region: process.env.AWS_SQS_REGION || 'default',
      publish_remove_queue: process.env.PUBLISH_REMOVE_QUEUE || 'default',
      publish_add_queue: process.env.PUBLISH_ADD_QUEUE || 'default',
    },
  },
  eventScheduling: {minutesOfTimeslotUnit: 5},
  'file-mgmt': {
    awsS3Bucket: process.env.FILE_MANAGEMENT_AWS_S3_BUCKET,
    awsCloudfrontDomain: process.env.FILE_MANAGEMENT_AWS_CLOUDFRONT_DOMAIN,
    localPath: process.env.FILE_MANAGEMENT_LOCAL_PATH || './uploaded-files',
  },
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
  token: {
    userAccess: {
      expiresIn: '10m',
      secret: process.env.USER_ACCESS_TOKEN_SECRET,
    },
    userRefresh: {
      expiresIn: '1440m',
      secret: process.env.USER_REFRESH_TOKEN_SECRET,
    },
    awsSecretKey: {
      secret: process.env.AWS_SECRETKEY_TOKEN_SECRET,
    },
  },
  voilanorbert: {
    apiKey: process.env.VOILANORBERT_API_KEY,
  },
}));
