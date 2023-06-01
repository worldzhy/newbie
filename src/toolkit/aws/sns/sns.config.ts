export function getAwsSnsConfig(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    region: process.env.AWS_SNS_REGION || 'default',
    accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY || 'default',
  };
}
