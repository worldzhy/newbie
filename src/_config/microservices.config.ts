import {registerAs} from '@nestjs/config';

export default registerAs('microservices', () => ({
  fmgmt: {
    localPath: process.env.FILE_MANAGEMENT_LOCAL_PATH || './uploaded-files',
    s3Bucket: process.env.FILE_MANAGEMENT_S3_BUCKET,
    cloudfrontDomain: process.env.FILE_MANAGEMENT_CLOUDFRONT_DOMAIN,
  },
  task: {
    region: process.env.TASK_AWS_SQS_REGION || 'default',
    accessKeyId: process.env.TASK_AWS_ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.TASK_AWS_SECRET_ACCESS_KEY || 'default',
    sqsQueueUrl: process.env.TASK_AWS_SQS_QUEUE_URL || 'default',
  },
}));
