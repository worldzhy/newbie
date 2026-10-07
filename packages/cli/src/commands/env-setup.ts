import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { bold, cyan, green, yellow } from "colorette";

import { assertExpectedAccount, getCallerIdentity } from "../lib/aws-identity";
import { CliError } from "../lib/errors";
import { readEnvToolConfig } from "../lib/env-tool-config";
import { execCapture, execLive } from "../lib/exec";

import { pickEnvironment, printCredentialHint } from "./env";
import { GlobalOptions } from "./shared";

export interface EnvSetupOptions extends GlobalOptions {
  environment?: string;
}

/**
 * Provision the per-account Secrets Manager rotation Lambda. The SST template
 * shipped inside the CLI package is copied into a stable per-account workdir
 * (so repeated runs reuse node_modules), then deployed with the caller's own
 * AWS credentials. The stack stage is the AWS account id — one stack per account.
 */
export async function runEnvSetup(options: EnvSetupOptions): Promise<void> {
  const { config: toolConfig } = await readEnvToolConfig(options.cwd);
  const envName = await pickEnvironment(toolConfig, options.environment);
  const envConfig = toolConfig.environments[envName];
  printCredentialHint();

  const identity = await getCallerIdentity(envConfig.region);
  assertExpectedAccount(identity, envConfig.expectedAccountId);
  console.info(cyan(`Deploying the rotation Lambda to account ${bold(identity.accountId)} (${envConfig.region})...\n`));

  // The template sits next to dist/ in the published tarball (../templates from
  // both src/commands and dist/commands).
  const templateDir = path.resolve(__dirname, "..", "..", "templates", "rotation-lambda");
  const workdir = path.join(os.homedir(), ".newbie", "rotation-lambda", identity.accountId);
  await fs.cp(templateDir, workdir, { recursive: true, force: true });

  if (options.dryRun) {
    console.info(yellow(`[dry-run] would run npm install and sst deploy --stage ${identity.accountId} in ${workdir}`));
    return;
  }

  await execLive("npm", ["install"], { cwd: workdir });
  const { stdout } = await execCapture("npx", ["sst", "deploy", "--stage", identity.accountId], { cwd: workdir });

  const lambdaArn = (stdout.match(/lambdaArn:\s+"?(arn:aws:lambda:[^"\s]+)"?/)?.[1] ?? "").trim();
  if (!lambdaArn) {
    throw new CliError("Deployment finished but the Lambda ARN could not be parsed from the SST output.");
  }

  console.info(green(`\n✓ Rotation Lambda deployed: ${bold(lambdaArn)}`));
  console.info(
    cyan(
      `\nPaste this ARN into the nightwatch project settings (awsSecretsManagerRotationLambdaArn) to enable ` +
        `automatic rotation for that project's secrets.\n` +
        `To remove the Lambda later: cd ${workdir} && npx sst remove --stage ${identity.accountId}\n`,
    ),
  );
}
