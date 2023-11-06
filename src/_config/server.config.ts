import {registerAs} from '@nestjs/config';

export default registerAs('server', () => ({
  environment: process.env.ENVIRONMENT ?? 'development', // support 'production' and 'development'.
  nodeFramework: 'express', // support 'express' and 'fastify'.
  port: parseInt(process.env.PORT ?? '3000'),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
  httpTimeout: 60000, // milliseconds
  httpMaxRedirects: 5,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD,
  },
}));
