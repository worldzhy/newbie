export function getPulumiConfig(): {
  awsVersion: string | undefined;
  accessToken: string | undefined;
} {
  return {
    awsVersion: process.env.PULUMI_AWS_VERSION,
    accessToken: process.env.PULUMI_ACCESS_TOKEN,
  };
}
