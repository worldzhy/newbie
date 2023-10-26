import {registerAs} from '@nestjs/config';

export default registerAs('server', () => ({
  environment: process.env.ENVIRONMENT ?? 'development',
  nodeFramework: process.env.NODE_FRAMEWORK ?? 'express', // support 'express' and 'fastify'.
  port: parseInt(process.env.PORT ?? '3000'),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
  httpTimeout: parseInt(process.env.HTTP_TIMEOUT ?? '600000'),
  httpMaxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS ?? '5'),
  database: {
    url: process.env.DATABASE_URL,
  },
}));
