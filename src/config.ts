import {registerAs} from '@nestjs/config';

export default registerAs('server', () => ({
  nodeFramework: 'express', // support 'express' and 'fastify'.
  environment: process.env.ENVIRONMENT ?? 'development', // support 'production' and 'development'.
  port: parseInt(process.env.PORT ?? '3000'),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
  isPrimary: parseInt(process.env.SERVER_SERIAL_NUMBER ?? '0') === 1,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  httpTimeout: 60000, // milliseconds
}));
