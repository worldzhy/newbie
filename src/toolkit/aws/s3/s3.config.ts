export function getAwsS3Config(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    region: process.env.AWS_S3_REGION || 'default',
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || 'default',
  };
}
