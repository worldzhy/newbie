import {registerAs} from '@nestjs/config';

export default registerAs('toolkit', () => ({
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
    },
  },
  elastic: {
    node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  logger: {
    awsSqsQueueUrl: process.env.LOGGER_AWS_SQS_QUEUE_URL || 'default',
  },
  token: {
    access: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      secret: process.env.ACCESS_TOKEN_SECRET,
    },
    refresh: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      secret: process.env.REFRESH_TOKEN_SECRET,
    },
  },
  bcrypt: {
    saltRounds: process.env.BCRYPT_SALT_ROUNDS,
  },
}));
