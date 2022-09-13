export function getAwsConfig(): {
  accountId: string | undefined;
  region: string | undefined;
  profile: string | undefined;
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  sqsLogQueueUrl: string | undefined;
  sqsTaskQueueUrl: string | undefined;
  pinpointApplicationId: string | undefined;
  pinpointFromAddress: string | undefined;
  pinpointSenderId: string | undefined;
  s3ForCloudformation: string | undefined;
} {
  return {
    accountId: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sqsLogQueueUrl: process.env.AWS_SQS_LOG_QUEUE_URL,
    sqsTaskQueueUrl: process.env.AWS_SQS_TASK_QUEUE_URL,
    pinpointApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID,
    pinpointFromAddress: process.env.AWS_PINPOINT_FROM_ADDRESS,
    pinpointSenderId: process.env.AWS_PINPOINT_SENDER_ID,
    s3ForCloudformation: process.env.AWS_S3_FOR_CLOUDFORMATION,
  };
}
