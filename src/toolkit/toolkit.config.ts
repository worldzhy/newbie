import {registerAs} from '@nestjs/config';

export default registerAs('toolkit', () => ({
  elastic: {
    node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
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
