import {registerAs} from '@nestjs/config';

export default registerAs('server', () => ({
  environment: process.env.ENVIRONMENT ?? 'development', // support 'production' and 'development'.
  nodeFramework: 'express', // support 'express' and 'fastify'.
  port: parseInt(process.env.PORT ?? '3000'),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
  httpTimeout: 60000, // milliseconds
  httpMaxRedirects: 5,
  database: {url: process.env.DATABASE_URL},
}));
