import {registerAs} from '@nestjs/config';

export default registerAs('toolkit', () => ({
  aws: {
    accountId: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3ForCloudformation: process.env.AWS_S3_FOR_CLOUDFORMATION,
    pinpoint: {
      region: process.env.AWS_PINPOINT_REGION || 'default',
      accessKeyId: process.env.AWS_PINPOINT_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_PINPOINT_SECRET_ACCESS_KEY || 'default',
      applicationId: process.env.AWS_PINPOINT_APPLICATION_ID || 'default',
      fromAddress: process.env.AWS_PINPOINT_FROM_ADDRESS || 'default',
      senderId: process.env.AWS_PINPOINT_SENDER_ID || 'default',
    },
    s3: {
      region: process.env.AWS_S3_REGION || 'default',
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || 'default',
    },
    sns: {
      region: process.env.AWS_SNS_REGION || 'default',
      accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY || 'default',
    },
    sqs: {
      region: process.env.AWS_SQS_REGION || 'default',
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID || 'default',
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY || 'default',
      logQueueUrl: process.env.AWS_SQS_LOG_QUEUE_URL || 'default',
      taskQueueUrl: process.env.AWS_SQS_TASK_QUEUE_URL || 'default',
    },
  },
  elastic: {
    node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  jwt: {
    bcryptSaltRounds: process.env.JWT_BCRYPT_SALT_ROUNDS,
    expiresIn: process.env.JWT_EXPIRES_IN,
    secret: process.env.JWT_SECRET,
  },
}));
