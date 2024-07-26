import {registerAs} from '@nestjs/config';

export default registerAs('microservices', () => ({
  cloudformation: {
    token: {
      secret:
        process.env.AWS_CLOUDFORMATION_SECRETKEY_TOKEN_SECRET ||
        'your-secretkey-token-secret',
    },
  },
}));
