import {registerAs} from '@nestjs/config';

export default registerAs('toolkit', () => ({
  bull: {
    redis: {
      host: process.env.BULL_REDIS_HOST,
      port: parseInt(process.env.BULL_REDIS_PORT ?? '6379'),
      password: process.env.BULL_REDIS_PASSWORD,
    },
  },
  cache: {
    memory: {
      ttl: 3600, // cache-manamger v4 => seconds, v5 => milliseconds
      max: 1000, // maximum number of items in cache
    },
    redis: {
      ttl: 86400, // cache-manamger v4 => seconds, v5 => milliseconds
      host: process.env.CACHE_REDIS_HOST,
      port: parseInt(process.env.CACHE_REDIS_PORT ?? '6379'),
      password: process.env.CACHE_REDIS_PASSWORD,
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
}));
