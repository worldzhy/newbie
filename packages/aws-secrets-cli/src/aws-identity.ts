import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

import { CliError } from "@devbie/newbie-cli/lib";

export interface AwsIdentity {
  accountId: string;
  arn: string;
}

/** Resolve the caller identity using the default credential chain (env vars, profile, SSO, IAM role). */
export async function getCallerIdentity(region: string): Promise<AwsIdentity> {
  const client = new STSClient({
    region,
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
        }
      : undefined,
  });
  const response = await client.send(new GetCallerIdentityCommand({}));
  return { accountId: response.Account ?? "", arn: response.Arn ?? "" };
}

/** Hard-fail when the active credentials do not belong to the configured account. */
export function assertExpectedAccount(identity: AwsIdentity, expectedAccountId: string | undefined): void {
  if (expectedAccountId && identity.accountId !== expectedAccountId) {
    throw new CliError(
      `AWS account mismatch: expected ${expectedAccountId} but credentials resolve to ${identity.accountId || "unknown"}.`,
    );
  }
}
