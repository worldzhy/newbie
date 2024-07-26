import {registerAs} from '@nestjs/config';

export default registerAs('microservices', () => ({
  aws: {
    sqs: {
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY,
      region: process.env.AWS_SQS_REGION || 'us-east-1',
      queueUrl: process.env.AWS_SQS_QUEUE_URL,
    },
  },
}));
