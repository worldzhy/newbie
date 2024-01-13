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
      publish_remove_queue: process.env.PUBLISH_REMOVE_QUEUE || 'default',
      publish_add_queue: process.env.PUBLISH_ADD_QUEUE || 'default',
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
  snowflake: {
    connectionOption: {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      password: process.env.SNOWFLAKE_PASSWORD,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      clientSessionKeepAlive: true,
      clientSessionKeepAliveHeartbeatFrequency: 3600,
    },
    poolOption: {
      max: 10,
      min: 0,
      acquireTimeoutMillis: 120000,
      evictionRunIntervalMillis: 60000,
      idleTimeoutMillis: 120000,
    },
  },
  cache: {
    memory: {
      ttl: 3600, // cache-manamger v4 => seconds, v5 => milliseconds
      max: 1000, // maximum number of items in cache
    },
    redis: {
      ttl: 86400, // cache-manamger v4 => seconds, v5 => milliseconds
    },
  },
}));
