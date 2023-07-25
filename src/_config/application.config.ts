import {registerAs} from '@nestjs/config';

export default registerAs('application', () => ({
  environment: process.env.ENVIRONMENT,
  nodeFramework: process.env.NODE_FRAMEWORK || 'express', // support 'express' and 'fastify'.
  port: parseInt(process.env.PORT!, 10),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
  database: {
    url: process.env.DATABASE_URL,
  },
  pulumi: {
    awsVersion: process.env.PULUMI_AWS_VERSION,
    accessToken: process.env.PULUMI_ACCESS_TOKEN,
  },
}));
