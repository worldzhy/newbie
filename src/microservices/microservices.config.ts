import {registerAs} from '@nestjs/config';
import {bool} from '@framework/utilities/bool.util';
import {int} from '@framework/utilities/int.util';

export default registerAs('microservices', () => ({
  account: {
    cache: {
      geolocationLruSize: int(process.env.CACHE_GEOLOCATION_LRU_SIZE, 100),
      apiKeyLruSize: int(process.env.CACHE_APIKEY_LRU_SIZE, 100),
    },
    ratelimiter: {
      ipLoginLimiter: {points: 10, durationSeconds: 600},
      userLoginLimiter: {points: 5, durationSeconds: 600},
      ipAccessLimiter: {points: 20, durationSeconds: 60},
      redis: {
        host: process.env.ACCOUNT_REDIS_HOST,
        port: int(process.env.ACCOUNT_REDIS_PORT, 6379),
      },
    },
    token: {
      secret: process.env.ACCOUNT_TOKEN_SECRET || 'your-token-secret',
      userAccess: {
        expiresIn: '1000m',
        secret:
          process.env.ACCOUNT_USER_ACCESS_TOKEN_SECRET ||
          'your-user-access-token-secret',
      },
      userRefresh: {
        expiresIn: '1440m',
        secret:
          process.env.ACCOUNT_USER_REFRESH_TOKEN_SECRET ||
          'your-user-refresh-token-secret',
      },
      apiKeyAccess: {
        secret:
          process.env.ACCOUNT_APIKEY_ACCESS_TOKEN_SECRET ||
          'your-apikey-access-token-secret',
      },
    },
    tracking: {
      mode: process.env.TRACKING_MODE || 'api-key',
      index: process.env.TRACKING_INDEX || 'saas-logs',
      deleteOldLogs: bool(process.env.TRACKING_DELETE_OLD_LOGS, true),
      deleteOldLogsDays: int(process.env.TRACKING_DELETE_OLD_LOGS_DAYS, 90),
    },
    verificationCode: {timeoutMinutes: 1, resendMinutes: 1},
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  'message-bot': {},
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
}));
