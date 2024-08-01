import {registerAs} from '@nestjs/config';

export default registerAs('microservices', () => ({
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
