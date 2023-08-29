export function getAwsConfig(): {
  accountId: string | undefined;
  region: string | undefined;
  profile: string | undefined;
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
} {
  return {
    accountId: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
