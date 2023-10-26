import {registerAs} from '@nestjs/config';

export default registerAs('application', () => ({
  environment: process.env.ENVIRONMENT ?? 'development',
  nodeFramework: process.env.NODE_FRAMEWORK ?? 'express', // support 'express' and 'fastify'.
  port: parseInt(process.env.PORT ?? '3000'), // default porot is 3000.
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
  httpRequestTimeout: parseInt(process.env.HTTP_REQUEST_TIMEOUT ?? '600000'), // default timeout is 10 minutes.
  database: {
    url: process.env.DATABASE_URL,
  },
  pulumi: {
    awsVersion: process.env.PULUMI_AWS_VERSION,
    accessToken: process.env.PULUMI_ACCESS_TOKEN,
  },
}));
