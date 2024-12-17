import {registerAs} from '@nestjs/config';
import {int} from './utilities/int.util';

export default registerAs('framework', () => ({
  nodeFramework: 'express', // support 'express' and 'fastify'.
  environment: process.env.ENVIRONMENT ?? 'development', // support 'production' and 'development'.
  server: {
    port: int(process.env.PORT, 3000),
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(','),
    isPrimary: int(process.env.SERVER_SERIAL_NUMBER, 0) === 1,
    httpTimeout: 60000, // milliseconds
  },
  app: {
    name: process.env.APP_NAME || 'Newbie',
    frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3001',
  },
}));
