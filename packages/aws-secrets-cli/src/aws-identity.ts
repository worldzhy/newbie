import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

import { CliError } from "@devbie/newbie-cli/lib";

export interface AwsIdentity {
  accountId: string;
  arn: string;
}

/** Resolve the caller identity using the default credential chain (env vars, profile, SSO, IAM role). */
export async function getCallerIdentity(region: string): Promise<AwsIdentity> {
  // No explicit credentials: the SDK default chain resolves env vars
  // (including AWS_SESSION_TOKEN, required for OIDC sessions), profiles,
  // SSO and IMDS role credentials. Manually constructing a credentials
  // object here would silently drop the session token and break OIDC.
  const client = new STSClient({ region });
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
