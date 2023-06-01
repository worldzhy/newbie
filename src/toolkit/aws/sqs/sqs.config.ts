export function getAwsSqsConfig(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sqsLogQueueUrl: string;
  sqsTaskQueueUrl: string;
} {
  return {
    region: process.env.AWS_SQS_REGION || 'default',
    accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY || 'default',
    sqsLogQueueUrl: process.env.AWS_SQS_LOG_QUEUE_URL || 'default',
    sqsTaskQueueUrl: process.env.AWS_SQS_TASK_QUEUE_URL || 'default',
  };
}
